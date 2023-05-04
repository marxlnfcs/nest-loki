import {ILokiJSPersistenceAdapter} from "../interfaces/adapter.interface";
import {ILokiJSOptions} from "../interfaces/options.interface";
import {Type} from "@nestjs/common";
import {ILokiJSEntityOptions} from "../interfaces/entity.interface";
import {LokiJSPersistentMemoryAdapter} from "./persistent-memory.adapter";
import {LokiJSPersistentFsAdapter} from "./persistent-fs.adapter";
import {isFunction} from "lodash";
import {decryptAES, encryptAES} from "../utils/crypto.utils";

/** @internal */
export class LokiJSPersistenceAdapter implements LokiPersistenceAdapter {
  private adapter: ILokiJSPersistenceAdapter;

  constructor(
    private options?: ILokiJSOptions|null,
    private collectionOptions?: ILokiJSEntityOptions|null,
  ){}

  private getOptions(): ILokiJSOptions {
    return {
      adapter: this.collectionOptions?.adapter || this.options?.adapter,
      persistenceMethod: this.collectionOptions?.persistenceMethod || this.options?.persistenceMethod,
      persistenceDataDir: this.options?.persistenceDataDir,
      encrypted: this.options?.encrypted,
      encryptedSecret: this.options?.encryptedSecret,
      throttledSaves: this.options?.throttledSaves,

      onLoaded: this.options?.onLoaded,
      onSaved: this.options?.onSaved,
    }
  }

  private getAdapter(): ILokiJSPersistenceAdapter {
    if(!this.adapter){
      if(this.getOptions().adapter){
        try{
          this.adapter = new (this.getOptions().adapter as Type<ILokiJSPersistenceAdapter>)();
        }catch{
          this.adapter = this.getOptions().adapter as ILokiJSPersistenceAdapter;
        }
      }else{
        switch(this.getOptions().persistenceMethod || 'memory') {
          case 'fs': {
            this.adapter = new LokiJSPersistentFsAdapter();
            break;
          }
          case 'memory': {
            this.adapter = new LokiJSPersistentMemoryAdapter();
            break;
          }
        }
      }
    }
    return this.adapter;
  }

  loadDatabase(databaseFile: string, callback: (value: any) => void) {
    this.getAdapter().loadCollection(databaseFile)
      .then(data => {
        if(isFunction(this.options?.onLoaded)){
          this.options.onLoaded(null, databaseFile);
        }
        callback(this.options.encrypted && this.options.encryptedSecret ? decryptAES(this.options.encryptedSecret, data.replace(/\n/g, '')) : data);
      })
      .catch(err => {
        if(isFunction(this.options?.onLoaded)){
          this.options.onLoaded(err, null);
        }
        callback(null);
      });
  }

  saveDatabase(databaseFile: string, databaseData: any, callback: (err?: Error | null) => void): void {
    if(typeof this.getAdapter()?.saveCollection === 'function'){
      databaseData = this.options.encrypted && this.options.encryptedSecret ? encryptAES(this.options.encryptedSecret, databaseData).match(/.{1,64}/g).join('\n') : databaseData;
      this.getAdapter().saveCollection(databaseFile, databaseData)
        .then(() => {
          if(isFunction(this.options?.onSaved)){
            this.options.onSaved(null, databaseFile);
          }
          callback();
        })
        .catch(err => {
          if(isFunction(this.options?.onSaved)){
            this.options.onSaved(err, databaseFile);
          }
          callback(err);
        });
    }else{
      callback();
    }
  }

  exportDatabase(databaseFile: string, databaseRef: Loki, callback: (err: Error|null) => void): void {
    if(typeof this.getAdapter()?.exportCollection === 'function'){
      this.getAdapter().exportCollection(databaseFile, databaseRef)
        .then(() => callback(null))
        .catch(err => callback(err));
    }else{
      callback(null);
    }
  }

  deleteDatabase(databaseFile: string, callback: (err?: Error|null, data?: any) => void): void {
    if(typeof this.getAdapter()?.deleteCollection === 'function'){
      this.getAdapter().deleteCollection(databaseFile)
        .then((data) => callback(null, data))
        .catch(err => callback(err));
    }else{
      callback();
    }
  }
}