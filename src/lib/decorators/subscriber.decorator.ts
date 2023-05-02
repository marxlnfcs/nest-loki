import {applyDecorators, Injectable, Type} from "@nestjs/common";
import {createClassDecorator} from "../utils/decorators.utils";
import {FeatureSetCollectionEntity, FeatureSetType} from "../utils/lokijs.utils";

export function LokiSubscriber<T extends object = any>(entity: Type<T>): ClassDecorator {
  return applyDecorators(
    Injectable(),
    createClassDecorator((target: any) => {
      FeatureSetType(target.prototype, 'subscriber');
      FeatureSetCollectionEntity(target.prototype, entity);
    }),
  )
}