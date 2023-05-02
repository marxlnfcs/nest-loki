import {DynamicModule, Global, Module, Provider, Type} from "@nestjs/common";
import {
  ILokiJSFeature,
  ILokiJSFeatureType,
  ILokiJSModuleAsyncOptions,
  ILokiJSModuleOptions
} from "./interfaces/options.interface";
import {
  LOKIJS_CONST_CLASS_TYPE,
  LOKIJS_CONST_TOKEN_COLLECTION,
  LOKIJS_CONST_TOKEN_REPOSITORY,
  LOKIJS_OPTIONS
} from "./lokijs.constants";
import {flatten} from "lodash";
import {LokiJSRepository} from "./models/repository.model";
import {getConstructorArguments, getMetadata} from "./utils/metadata.utils";
import {ILokiJSSubscriber} from "./interfaces/subscriber.interface";
import {
  FeatureAddCollectionSubscriber,
  FeatureGetCollectionEntity,
  FeatureGetCollectionEntityColumns,
  FeatureGetCollectionName,
  FeatureGetCollectionOptions,
  FeatureSetCollection
} from "./utils/lokijs.utils";
import {createCollection, createConnectionOptions, getConnectionOptions} from "./lokijs.storage";
import {CreateRepositoryMetadata} from "./decorators/repository.decorator";
import {LokiJSService} from "./lokijs.service";

export class LokiJSModule {

  /**
   * Initializes the base functionalities
   * @param options
   */
  static forRoot(options?: ILokiJSModuleOptions): DynamicModule {
    return {
      module: LokiJSModule,
      imports: [LokiJSCoreModule.forRoot(options)]
    }
  }

  /**
   * Initialized the base functionalities async
   * @param options
   */
  static forRootAsync(options?: ILokiJSModuleAsyncOptions): DynamicModule {
    return {
      module: LokiJSModule,
      imports: [LokiJSCoreModule.forRootAsync(options)]
    }
  }

  /**
   * Method to add features like Repository, Subscribers or Entities
   * @param args
   */
  static forFeature(...args: Array<ILokiJSFeature|ILokiJSFeature[]>): DynamicModule {

    // flatten features
    const features = flatten(args);

    // get features
    const entities = features.filter(f => this.getFeatureType(f) === 'entity');
    const repositories = features.filter(f => this.getFeatureType(f) === 'repository');
    const subscribers = features.filter(f => this.getFeatureType(f) === 'subscriber');

    // create providers
    const subscriberProviders = flatten(subscribers.map(f => this.createSubscriberProviders(f as any)));
    const repositoryProviders = flatten(repositories.map(f => this.createRepositoryProviders(f as any)));
    const entityProviders = flatten(entities.map(f => this.createEntityProviders(f as any)));
    const providers: Provider[] = flatten([subscriberProviders, repositoryProviders, entityProviders]);

    // create module
    return {
      module: LokiJSModule,
      providers: providers,
      exports: providers,
    }

  }

  /** Returns the type of the feature */
  private static getFeatureType(feature: ILokiJSFeature): ILokiJSFeatureType|null {
    return feature ? getMetadata<ILokiJSFeatureType>(LOKIJS_CONST_CLASS_TYPE, feature.prototype) || null : null;
  }

  /** Create entity providers */
  private static createEntityProviders(entity: Type): Provider[] {

    // get required data
    const collectionName = FeatureGetCollectionName(entity.prototype);

    // create array from providers
    const providers: Provider[] = [];

    // add collection to providers
    providers.push({
      provide: LOKIJS_CONST_TOKEN_COLLECTION(collectionName),
      useFactory: async (options) => {

        // create collection
        const collection = await createCollection(
          collectionName,
          options,
          FeatureGetCollectionOptions(entity.prototype),
          FeatureGetCollectionEntityColumns(entity.prototype),
        );

        // assign collection to entity
        FeatureSetCollection(entity.prototype, collection);

        // return collection
        return collection;

      },
      inject: [LOKIJS_OPTIONS]
    });

    // add repository to providers
    providers.push({
      provide: LOKIJS_CONST_TOKEN_REPOSITORY(FeatureGetCollectionName(entity.prototype)),
      useFactory: () => CreateRepositoryMetadata(new LokiJSRepository(), entity),
    });

    // return providers
    return providers;

  }

  /** Create repository providers */
  private static createRepositoryProviders(repository: Type<LokiJSRepository>): Provider[] {
    if(FeatureGetCollectionEntity(repository.prototype)){

      // create providers
      const providers: Provider[] = [];

      // add provider to array
      providers.push({
        provide: repository,
        useFactory: (...args: any[]) => CreateRepositoryMetadata(new repository(...args), FeatureGetCollectionEntity(repository.prototype)),
        inject: getConstructorArguments(repository.prototype)
      });

      // return providers
      return providers;

    }
    return [];
  }

  /** Create subscriber providers */
  private static createSubscriberProviders(subscriber: Type<ILokiJSSubscriber>): Provider[] {
    if(FeatureGetCollectionEntity(subscriber.prototype)){

      // create providers
      const providers: Provider[] = [];

      // add provider to array
      providers.push({
        provide: subscriber,
        useFactory: (...args: any[]) => {
          const instance = CreateRepositoryMetadata(new subscriber(...args), FeatureGetCollectionEntity(subscriber.prototype));
          FeatureAddCollectionSubscriber(FeatureGetCollectionEntity(subscriber.prototype).prototype, instance);
          return instance;
        },
        inject: getConstructorArguments(subscriber.prototype)
      });

      // return providers
      return providers;

    }
    return [];
  }

}

export class LokiJSCoreModule {

  /**
   * Initializes the base functionalities
   * @param options
   */
  static forRoot(options?: ILokiJSModuleOptions): DynamicModule {
    return this.forRootAsync({
      useFactory: () => options,
    });
  }

  /**
   * Initialized the base functionalities async
   * @param options
   */
  static forRootAsync(options?: ILokiJSModuleAsyncOptions): DynamicModule {

    // create array for providers
    const providers: Provider[] = [
      {
        provide: LOKIJS_OPTIONS,
        useFactory: async (...args: any[]) => {
          const opts = options?.useFactory ? await options.useFactory(...args) : {};
          createConnectionOptions(opts?.connection || 'default', opts);
          return opts;
        },
        inject: options?.inject,
      },
      LokiJSService,
    ];

    // return module
    return {
      global: true,
      module: LokiJSModule,
      providers: providers,
      exports: providers
    };

  }

}