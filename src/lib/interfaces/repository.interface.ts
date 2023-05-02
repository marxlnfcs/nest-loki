import {LokiJSCollection, LokiJSDatabase} from "../models/collection.model";
import {Type} from "@nestjs/common";
import {ILokiJSSubscriber} from "./subscriber.interface";
import {ILokiJSColumn} from "./column.interface";

export type ILokiJSQuery<Entity extends object = any> = LokiQuery<Entity & LokiObj>;
export interface ILokiJSRepositoryMetadata<Entity extends object = any> {
  database: LokiJSDatabase;
  collection: LokiJSCollection<Entity>;
  entity: Type<Entity>;
  subscribers: ILokiJSSubscriber<Entity>[];
  columns: ILokiJSColumn[];
}