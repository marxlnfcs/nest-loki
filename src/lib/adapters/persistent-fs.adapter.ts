import {ILokiJSCollectionRef, ILokiJSPersistenceAdapter} from "../interfaces/adapter.interface";
import {existsSync, mkdirSync, readFileSync, renameSync, rmSync, readdirSync, statSync, writeFileSync} from "fs";
import {dirname} from 'path';

export class LokiJSPersistentFsAdapter implements ILokiJSPersistenceAdapter {
  private checkDataDir(collectionFile: string): void {
    const collectionDir = dirname(collectionFile);
    if(!existsSync(collectionDir)){
      mkdirSync(collectionDir, {
        recursive: true,
        mode: 0o770
      });
    }
  }

  loadCollection(collectionFile: string): Promise<string|null> {
    return new Promise<string|null>((resolve, reject) => {
      try{

        // check data directory
        this.checkDataDir(collectionFile);

        // return null if the file does not exist
        if(!existsSync(collectionFile)){
          return resolve(null);
        }

        // get stats of collection file
        const stats = statSync(collectionFile);

        // return null if the file is not a file
        if(!stats.isFile()){
          return resolve(null);
        }

        // read content of file
        const content = readFileSync(collectionFile, 'utf8');

        // resolve content
        resolve(content);

      }catch(e){
        reject(e);
      }
    });
  }

  saveCollection(collectionFile: string, collectionData: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try{

        // check data directory
        this.checkDataDir(collectionFile);

        // create temporary name for the file
        const temporaryCollectionFile = collectionFile + '~';

        // write contents to temporary file
        writeFileSync(temporaryCollectionFile, collectionData, {
          mode: 0o770
        });

        // delete old collection file
        if(existsSync(collectionFile)){
          rmSync(collectionFile);
        }

        // rename temporary collection file
        renameSync(temporaryCollectionFile, collectionFile);

        // resolve
        resolve();

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
        rmSync(collectionFile);
        if(!readdirSync(dirname(collectionFile)).length){
          rmSync(dirname(collectionFile), {
            recursive: true,
          });
        }
        resolve();
      }catch(e){
        reject(e);
      }
    });
  }
}