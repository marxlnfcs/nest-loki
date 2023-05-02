import {applyDecorators, Inject, Injectable, Type} from "@nestjs/common";
import {
  FeatureGetCollectionEntityColumns,
  FeatureGetCollectionName,
  FeatureGetCollectionSubscribers,
  FeatureSetCollectionEntity,
  FeatureSetType
} from "../utils/lokijs.utils";
import {createClassDecorator, createConstructor} from "../utils/decorators.utils";
import {LOKIJS_CONST_TOKEN_REPOSITORY} from "../lokijs.constants";
import {getCollection, getCollectionDatabase} from "../lokijs.storage";
import {ILokiJSRepositoryMetadata} from "../interfaces/repository.interface";

export function LokiRepository<Entity extends object = any>(entity: Type<Entity>): ClassDecorator {
  return (target: any) => {

    // apply core decorators
    applyDecorators(
      Injectable(),
      createClassDecorator((target: any) => {
        FeatureSetType(target.prototype, 'repository');
        FeatureSetCollectionEntity(target.prototype, entity);
      })
    )(target);

    // create constructor wrapper
    return createConstructor((instance: any) => {
      CreateRepositoryMetadata(instance, entity);
    })(target);

  }
}

export function InjectRepository<Entity extends object = any>(entity: Type<Entity>): ClassDecorator {
  return applyDecorators(
    Inject(LOKIJS_CONST_TOKEN_REPOSITORY(FeatureGetCollectionName(entity.prototype))),
  );
}

/** @internal */
const REPOSITORY_ENTITY = Symbol();
/** @internal */
export function CreateRepositoryMetadata<Entity extends object = any>(repository: any, entity: Type<Entity>): any {
  if(!repository[REPOSITORY_ENTITY]){
    repository[REPOSITORY_ENTITY] = entity;
  }
  return repository;
}

/** @internal */
export function GetRepositoryMetadata<Entity extends object = any>(repository: any): ILokiJSRepositoryMetadata<Entity> {
  const entity = repository[REPOSITORY_ENTITY];
  return {
    database: getCollectionDatabase(FeatureGetCollectionName(entity.prototype)),
    collection: getCollection(FeatureGetCollectionName(entity.prototype)),
    entity: entity,
    subscribers: FeatureGetCollectionSubscribers(entity.prototype),
    columns: FeatureGetCollectionEntityColumns(entity.prototype),
  }
}