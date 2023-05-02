import {ILokiJSPersistenceAdapter} from "./adapter.interface";
import {Type} from "@nestjs/common";

export interface ILokiJSOptions {
  adapter?: ILokiJSPersistenceAdapter|Type<ILokiJSPersistenceAdapter>|null;
  persistenceMethod?: "fs"|"memory"|null;
  persistenceDataDir?: string;
  encrypted?: boolean;
  encryptedSecret?: string;
  throttledSaves?: boolean;

  onLoaded?: (err?: any) => void;
  onSaved?: (err?: any) => void;
}

export type ILokiJSConnection = 'default'|string;

export interface ILokiJSModuleOptions extends ILokiJSOptions {
  /** @internal */
  connection?: ILokiJSConnection;
}
export interface ILokiJSModuleAsyncOptions {
  useFactory: (...args: any[]) => ILokiJSModuleOptions|Promise<ILokiJSModuleOptions>;
  inject?: any[];
}

export type ILokiJSFeature = Type;
export type ILokiJSFeatureType = 'entity'|'repository'|'subscriber'|'collection'|'standalone-collection';