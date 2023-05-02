import {applyDecorators, Injectable, Type} from "@nestjs/common";
import {createClassDecorator, createConstructor} from "../utils/decorators.utils";
import {
  FeatureAddCollectionSubscriber,
  FeatureGetCollectionEntity,
  FeatureSetCollectionEntity,
  FeatureSetType
} from "../utils/lokijs.utils";

export function LokiSubscriber<T extends object = any>(entity: Type<T>): ClassDecorator {
  return (target: any) => {

    // apply core decorators
    applyDecorators(
      Injectable(),
      createClassDecorator((target: any) => {
        FeatureSetType(target.prototype, 'subscriber');
        FeatureSetCollectionEntity(target.prototype, entity);
      }),
    )(target);

    // create constructor wrapper
    return createConstructor((instance: any) => FeatureAddCollectionSubscriber(FeatureGetCollectionEntity(target.prototype).prototype, instance))(target);

  }
}