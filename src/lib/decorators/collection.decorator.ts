import {Inject, Type} from "@nestjs/common";
import {FeatureGetCollectionName} from "../utils/lokijs.utils";
import {LOKIJS_CONST_TOKEN_COLLECTION} from "../lokijs.constants";

//export function InjectCollection(name: string): ParameterDecorator;
export function InjectCollection<Entity extends object = any>(entity: Type<Entity>): ParameterDecorator;
export function InjectCollection<Entity extends object = any>(nameOrEntity: string|Type<Entity>): ParameterDecorator {
  return Inject(LOKIJS_CONST_TOKEN_COLLECTION(typeof nameOrEntity === 'string' ? nameOrEntity : FeatureGetCollectionName(nameOrEntity.prototype)));
}