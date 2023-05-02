import {ILokiJSCollectionRef, ILokiJSPersistenceAdapter} from "../interfaces/adapter.interface";
import {LokiMemoryAdapter} from "lokijs";

export class LokiJSPersistentMemoryAdapter implements ILokiJSPersistenceAdapter {
  private adapter = new LokiMemoryAdapter();

  loadCollection(collectionFile: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      try{
        this.adapter.loadDatabase(collectionFile, (value) => resolve(value));
      }catch(e){
        reject(e);
      }
    });
  }

  saveCollection(collectionFile: string, collectionData: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try{
        this.adapter.saveDatabase(collectionFile, collectionData, (err) => err ? reject(err) : resolve());
      }catch(e){
        reject(e);
      }
    });
  }

  exportCollection(collectionFile: string, collectionRef: ILokiJSCollectionRef): Promise<void> {
    return new Promise<void>((resolve) => resolve());
  }

  deleteCollection(collectionFile: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try{
        this.adapter.deleteDatabase(collectionFile, (err) => err ? reject(err) : resolve());
      }catch(e){
        reject(e);
      }
    });
  }
}