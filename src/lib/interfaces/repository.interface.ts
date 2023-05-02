import {Type} from "@nestjs/common";
import {ILokiJSSubscriber} from "./subscriber.interface";
import {ILokiJSColumn} from "./column.interface";
import {Collection} from "lokijs";

export type ILokiJSQuery<Entity extends object = any> = LokiQuery<Entity & LokiObj>;
export interface ILokiJSRepositoryMetadata<Entity extends object = any> {
  database: Loki;
  collection: Collection<Entity>;
  entity: Type<Entity>;
  subscribers: ILokiJSSubscriber<Entity>[];
  columns: ILokiJSColumn[];
}