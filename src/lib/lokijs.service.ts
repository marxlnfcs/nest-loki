import {Injectable, Type} from "@nestjs/common";
import {LokiJSRepository} from "./models/repository.model";
import {CreateRepositoryMetadata} from "./decorators/repository.decorator";
import {createCollection, getCollection} from "./lokijs.storage";
import {FeatureGetCollectionName} from "./utils/lokijs.utils";
import {ILokiJSOptions} from "./interfaces/options.interface";
import {ILokiJSEntityOptions} from "./interfaces/entity.interface";
import {Collection} from "lokijs";

@Injectable()
export class LokiJSService {
  getRepository<Entity extends object = any>(entity: Type<Entity>): LokiJSRepository<Entity> {
    return CreateRepositoryMetadata(new LokiJSRepository(), entity);
  }

  getCollection<Entity extends object = any>(name: string): Collection<Entity>|null;
  getCollection<Entity extends object = any>(entity: Type<Entity>): Collection<Entity>|null;
  getCollection<Entity extends object = any>(entityOrName: Type<Entity>|string): Collection<Entity>|null {
    return getCollection(typeof entityOrName === 'string' ? entityOrName : FeatureGetCollectionName(entityOrName));
  }

  createCollection<Entity extends object = any>(name: string, options?: ILokiJSOptions & ILokiJSEntityOptions): Promise<Collection<Entity>>;
  createCollection<Entity extends object = any>(entity: Type<Entity>, options?: ILokiJSOptions & ILokiJSEntityOptions): Promise<Collection<Entity>>;
  createCollection<Entity extends object = any>(entityOrName: Type<Entity>|string, options?: ILokiJSOptions & ILokiJSEntityOptions): Promise<Collection<Entity>> {
    return createCollection(typeof entityOrName === 'string' ? entityOrName : FeatureGetCollectionName(entityOrName), options, options);
  }
}