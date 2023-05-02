import {ILokiJSConnection, ILokiJSOptions} from "./options.interface";

export interface ILokiJSEntityOptions<Entity extends object = any> extends Pick<ILokiJSOptions, 'adapter'|'persistenceMethod'> {
  disableMeta?: boolean;
  disableChangesApi?: boolean;
  disableDeltaChangesApi?: boolean;
  disableFreeze?: boolean;
  adaptiveBinaryIndices?: boolean;
  asyncListeners?: boolean;
  serializableIndices?: boolean;
  transactional?: boolean;
  ttl?: number;
  ttlInterval?: number;

  /** @internal */
  connection?: ILokiJSConnection;
}