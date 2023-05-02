import {ILokiJSEntityOptions} from "../interfaces/entity.interface";
import {applyDecorators, Injectable} from "@nestjs/common";
import {FeatureSetCollectionName, FeatureSetCollectionOptions, FeatureSetType} from "../utils/lokijs.utils";
import {createClassDecorator} from "../utils/decorators.utils";

export function LokiEntity(collectionName: string, options?: ILokiJSEntityOptions): ClassDecorator {
  return applyDecorators(
    Injectable(),
    createClassDecorator((target: any) => {
      FeatureSetType(target.prototype, 'entity');
      FeatureSetCollectionName(target.prototype, collectionName);
      FeatureSetCollectionOptions(target.prototype, options);
    }),
  )
}