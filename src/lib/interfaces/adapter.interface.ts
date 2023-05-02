import * as Loki from 'lokijs';

export type ILokiJSCollectionRef = Loki;
export interface ILokiJSPersistenceAdapter {
  mode?: string | undefined;
  loadCollection(collectionFile: string): Promise<string|null>;
  saveCollection?(collectionFile: string, collectionData: string): Promise<void>;
  exportCollection?(collectionFile: string, collectionRef: ILokiJSCollectionRef): Promise<void>;
  deleteCollection?(collectionFile: string): Promise<any>;
}