import {ILokiJSFeatureType} from "../interfaces/options.interface";
import {getMetadata, setMetadata} from "./metadata.utils";
import {
  LOKIJS_CONST_CLASS_TYPE,
  LOKIJS_CONST_COLLECTION, LOKIJS_CONST_COLLECTION_COLUMNS,
  LOKIJS_CONST_COLLECTION_ENTITY,
  LOKIJS_CONST_COLLECTION_NAME,
  LOKIJS_CONST_COLLECTION_OPTIONS,
  LOKIJS_CONST_COLLECTION_SUBSCRIBERS
} from "../lokijs.constants";
import {ILokiJSEntityOptions} from "../interfaces/entity.interface";
import {Collection} from "lokijs";
import {Type} from "@nestjs/common";
import {ILokiJSSubscriber} from "../interfaces/subscriber.interface";
import {ILokiJSColumn, ILokiJSColumnOptions} from "../interfaces/column.interface";

/** @internal */
export const FeatureSetType = (target: any, feature: ILokiJSFeatureType): ILokiJSFeatureType => setMetadata(LOKIJS_CONST_CLASS_TYPE, feature, target);
/** @internal */
export const FeatureGetType = (target: any): ILokiJSFeatureType|null => getMetadata(LOKIJS_CONST_CLASS_TYPE, target) || null;

/** @internal */
export const FeatureSetCollection = <Entity extends object = any>(target: any, collection: Collection<Entity>): Collection<Entity> => setMetadata(LOKIJS_CONST_COLLECTION, collection, target);
/** @internal */
export const FeatureGetCollection = <Entity extends object = any>(target: any): Collection<Entity> => getMetadata(LOKIJS_CONST_COLLECTION, target) || null;

/** @internal */
export const FeatureSetCollectionName = (target: any, name: string): string => setMetadata(LOKIJS_CONST_COLLECTION_NAME, name, target);
/** @internal */
export const FeatureGetCollectionName = (target: any): string => getMetadata(LOKIJS_CONST_COLLECTION_NAME, target);

/** @internal */
export const FeatureSetCollectionOptions = (target: any, options?: ILokiJSEntityOptions): ILokiJSEntityOptions => setMetadata(LOKIJS_CONST_COLLECTION_OPTIONS, options || {}, target);
/** @internal */
export const FeatureGetCollectionOptions = (target: any): ILokiJSEntityOptions => getMetadata(LOKIJS_CONST_COLLECTION_OPTIONS, target) || {};

/** @internal */
export const FeatureSetCollectionEntity = <Entity extends object = any>(target: any, entity: Type<Entity>): Type<Entity> => setMetadata(LOKIJS_CONST_COLLECTION_ENTITY, entity, target);
/** @internal */
export const FeatureGetCollectionEntity = <Entity extends object = any>(target: any): Type<Entity>|null => getMetadata(LOKIJS_CONST_COLLECTION_ENTITY, target) || null;

/** @internal */
export const FeatureAddCollectionSubscriber = <Entity extends object = any>(target: any, subscriber: ILokiJSSubscriber<Entity>): ILokiJSSubscriber<Entity>[] => {
  const subscribers: ILokiJSSubscriber<Entity>[] = getMetadata(LOKIJS_CONST_COLLECTION_SUBSCRIBERS, target) || [];
  subscribers.push(subscriber);
  return setMetadata(LOKIJS_CONST_COLLECTION_SUBSCRIBERS, subscribers, target);
}
/** @internal */
export const FeatureGetCollectionSubscribers = <Entity extends object = any>(target: any): ILokiJSSubscriber<Entity>[] => (getMetadata(LOKIJS_CONST_COLLECTION_SUBSCRIBERS, target) || []).filter(c => !!c);

/** @internal */
export const FeatureAddCollectionEntityColumn = <Options extends object = any, Value = any>(target: any, column: ILokiJSColumn<Options & ILokiJSColumnOptions>): ILokiJSColumn<Options, Value>[] => {
  const columns: ILokiJSColumn<Options, Value>[] = getMetadata(LOKIJS_CONST_COLLECTION_COLUMNS, target) || [];
  columns.push(column);
  return setMetadata(LOKIJS_CONST_COLLECTION_COLUMNS, columns, target);
}
/** @internal */
export const FeatureGetCollectionEntityColumns = (target: any): ILokiJSColumn[] => (getMetadata(LOKIJS_CONST_COLLECTION_COLUMNS, target) || []).filter(c => !!c);