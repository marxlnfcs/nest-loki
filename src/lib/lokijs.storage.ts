import {ILokiJSConnection, ILokiJSOptions} from "./interfaces/options.interface";
import * as Loki from "lokijs";
import {Collection} from "lokijs";
import * as slug from "slug";
import {join} from "path";
import {LokiJSPersistenceAdapter} from "./adapters/persistent.adapter";
import {LokiJSException} from "./models/exception.model";
import {ILokiJSEntityOptions} from "./interfaces/entity.interface";
import {LokiJSDatabase} from "./models/collection.model";
import {ILokiJSColumn} from "./interfaces/column.interface";

type CollectionStorage = { [name: string]: CollectionStorageItem };
type CollectionStorageItem = {
  name: string,
  database: Loki,
  collection: Collection,
  options: ILokiJSOptions;
};

type ConnectionStorage = { [name: string]: ILokiJSOptions };

const CONNECTIONS: ConnectionStorage = {};
const COLLECTIONS: CollectionStorage = {};

/** @internal */
export function getConnectionOptions(name?: ILokiJSConnection): ILokiJSOptions {
  name = slug(name || 'default');
  return CONNECTIONS[name] || {};
}

/** @internal */
export function createConnectionOptions(name?: ILokiJSConnection, options?: ILokiJSOptions): ILokiJSOptions {
  name = slug(name || 'default');
  CONNECTIONS[name] = options || {};
  return CONNECTIONS[name];
}

/** @internal */
export function getCollection<Entity extends object = any>(name: string): Collection<Entity>|null {
  name = slug(name);
  return COLLECTIONS[name] ? COLLECTIONS[name].collection : null;
}

/** @internal */
export function getCollections(): CollectionStorageItem[] {
  return Object.values(COLLECTIONS);
}

/** @internal */
export function getCollectionDatabase(name: string): LokiJSDatabase|null {
  name = slug(name);
  return COLLECTIONS[name] ? COLLECTIONS[name].database : null;
}

/** @internal */
export function createCollection<Entity extends object = any>(name: string, options?: ILokiJSOptions, collectionOptions?: ILokiJSEntityOptions, columns?: ILokiJSColumn[]): Promise<Collection<Entity>> {
  return new Promise<Collection<Entity>>(async (resolve, reject) => {
    try{

      // slugify collection name and set collection path
      const collectionName = slug(name);
      const collectionFile = join(process.cwd(), options?.persistenceDataDir || 'database', `${collectionName}.db`);

      // return collection if already exists
      if(Object.keys(COLLECTIONS).includes(collectionName)) {
        return resolve(COLLECTIONS[collectionName].collection);
      }

      // create database connection
      const database = new Loki(collectionFile, {
        adapter: new LokiJSPersistenceAdapter(options, collectionOptions),
        autoload: false,
        autosave: true,
        autosaveCallback: (err) => {
          if(typeof options?.onSaved === 'function'){
            options.onSaved(err);
          }
        },
        serializationMethod: 'pretty',
        throttledSaves: options?.throttledSaves,
      });

      // load database
      await Promise.resolve(new Promise<void>(async (resolve, reject) => {
        try{
          await Promise.resolve(new Promise<void>(async (resolve, reject) => database.loadDatabase({}, (err) => err ? reject(err) : resolve())));
          await Promise.resolve(new Promise<void>(async (resolve, reject) => database.saveDatabase((err) => err ? reject(err) : resolve())));
          resolve();
        }catch(e){
          reject(e);
        }
      }));

      // add collection to list
      COLLECTIONS[collectionName] = {
        name: collectionName,
        database: database,
        collection: database.getCollection(collectionName) || database.addCollection(collectionName, {
          ...(collectionOptions || {}),
          unique: (columns || []).filter(c => c.options?.unique).map(c => c.name),
          indices: (columns || []).filter(c => c.options?.indices).map(c => c.name),
          disableMeta: true,
        }),
        options: options || {},
      };

      // resolve collection
      resolve(COLLECTIONS[collectionName].collection);

    }catch(e){
      reject(new LokiJSException(e.message));
    }
  });
}

/** @internal */
export function deleteCollection(name: string): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try{

      // get collection
      const c = COLLECTIONS[slug(name)];

      // resolve without any action if the collection does not exist
      if(!c){
        return resolve();
      }

      // delete and close database
      await Promise.resolve(new Promise<void>((resolve, reject) => c.database.close((err) => err ? reject(err) : resolve())));
      await Promise.resolve(new Promise<void>((resolve, reject) => c.database.deleteDatabase((err) => err ? reject(err) : resolve())));

      // remove collection from collection object
      delete COLLECTIONS[slug(name)];

      // resolve
      resolve();

    }catch(e){
      reject(new LokiJSException(e.message));
    }
  });
}

/** @internal */
export function closeCollection(name: string): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try{

      // get collection
      const c = COLLECTIONS[slug(name)];

      // resolve without any action if the collection does not exist
      if(!c){
        return resolve();
      }

      // close collection
      await Promise.resolve(new Promise<void>((resolve, reject) => c.database.close((err) => err ? reject(err) : resolve())));

      // remove collection from collection object
      delete COLLECTIONS[slug(name)];

      // resolve
      resolve();

    }catch(e){
      reject(new LokiJSException(e.message));
    }
  });
}

/** @internal */
export function closeCollections(): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try{
      for(let c of Object.values(COLLECTIONS)) {
        await closeCollection(c.name);
      }
      resolve();
    }catch(e){
      reject(new LokiJSException(e.message));
    }
  });
}

/** @internal */
export function deleteCollections(): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try{
      for(let c of Object.values(COLLECTIONS)) {
        await deleteCollection(c.name);
      }
      resolve();
    }catch(e){
      reject(new LokiJSException(e.message));
    }
  });
}