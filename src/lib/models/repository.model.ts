import {LokiJSEntityNotFoundException} from "./exception.model";
import {isFunction, isNil, isUndefined} from "../utils/common.utils";
import {
  LokiJSInputValidationError,
  LokiJSInputValidationNotNullableError
} from "../exceptions/input-validation-error.exception";
import {cloneDeep} from "lodash";
import {GetRepositoryMetadata} from "../decorators/repository.decorator";
import {ILokiJSQuery} from "../interfaces/repository.interface";
import * as Loki from "lokijs";
import {Collection} from "lokijs";

export class LokiJSRepository<Entity extends object = any> {
  /** @internal */
  get __metadata__(){ return GetRepositoryMetadata(this) }

  /**
   * Returns the LokiJS collection
   */
  getCollection(): Collection<Entity> {
    return this.__metadata__.collection;
  }

  /**
   * Returns the LokiJS database where the collection is stored in
   */
  getCollectionDatabase(): Loki {
    return this.__metadata__.database;
  }

  /**
   * Returns a new entity
   * @param dto
   */
  create(dto?: Partial<Entity>): Entity {
    try{
      return Object.assign(new this.__metadata__.entity(), dto || {});
    }catch{
      return (dto || {}) as Entity;
    }
  }

  /**
   * Returns a list of all entity that matches the provided conditions
   * @param conditions
   * @param executeSubscribers
   */
  find(conditions?: ILokiJSQuery<Entity>, executeSubscribers: boolean = true): Promise<Entity[]> {
    return new Promise<Entity[]>(async (resolve, reject) => {
      try{
        // create array for all found entities
        const entities: Entity[] = [];

        // get a list of all entities matching the provided condition
        // needs to be cloned, to prevent direct changes in the database
        const databaseEntities: Entity[] = this.__metadata__.collection.find(conditions).map(e => this.cloneEntity(e));

        // process all entities
        for(let databaseEntity of databaseEntities){

          // format the columns of the entity
          let entity: Entity = await this.prepareEntityForRead(databaseEntity);

          // run subscribers assigned to the entity
          for(let subscriber of this.__metadata__.subscribers.filter(s => executeSubscribers && isFunction(s.afterLoad))){
            entity = (await subscriber.afterLoad(entity)) || entity;
          }

          // add entity to array
          entities.push(entity);

        }

        // return entities
        resolve(entities);

      }catch(e){
        reject(e);
      }
    });
  }

  /**
   * Returns on entity by conditions. If the entity does not exist, the Promise returns null
   * @param conditions
   * @param executeSubscribers
   */
  findOne(conditions: ILokiJSQuery<Entity>, executeSubscribers: boolean = true): Promise<Entity|null> {
    return new Promise<Entity|null>(async (resolve, reject) => {
      try{

        // fetch entity from database
        let databaseEntity: Entity = await this.__metadata__.collection.findOne(conditions);

        // clone entity to prevent direct changes to the database
        let entity: Entity = this.cloneEntity(databaseEntity);

        // resolve entity if null
        if(isNil(entity)){
          return resolve(null);
        }

        // format the columns of the entity
        entity = await this.prepareEntityForRead(entity);

        // execute subscribers assigned to the entity
        for(let subscriber of this.__metadata__.subscribers.filter(s => executeSubscribers && isFunction(s.afterLoad))){
          entity = (await subscriber.afterLoad(entity)) || entity;
        }

        // resolve entity or null
        resolve(entity);

      }catch(e){
        reject(e);
      }
    });
  }

  /**
   * Validates and formats all columns in the entity
   * @param entity
   * @private
   */
  private prepareEntityForRead(entity: Entity): Promise<Entity> {
    return new Promise<Entity>(async (resolve, reject) => {
      try{
        for(let column of this.__metadata__.columns) {
          if(isUndefined(entity[column.name])){
            entity[column.name] = !isNil(column.default) ? column.default : column.options?.nullable ? null : entity[column.name];
          }
          if(isFunction(column.onRead)){
             const value = await column.onRead(column?.options || {}, entity[column.name] ?? null);
             if(!isUndefined(value)){
               entity[column.name] = value;
             }
          }
        }
        resolve(entity);
      }catch(e){
        reject(e);
      }
    });
  }

  /**
   * Returns one entity by conditions. If the entity does not exist, the Promise rejects
   * @param conditions
   * @param executeSubscribers
   */
  findOneOrFail(conditions: ILokiJSQuery<Entity>, executeSubscribers: boolean = true): Promise<Entity> {
    return new Promise<Entity>(async (resolve, reject) => {
      try{
        let entity = await this.findOne(conditions, executeSubscribers);
        if(!entity){
          throw new LokiJSEntityNotFoundException(this.__metadata__.collection.name, conditions);
        }
        resolve(entity);
      }catch(e){
        reject(e);
      }
    });
  }

  /**
   * Returns true if the requested entity exists
   * @param conditions
   */
  exists(conditions: ILokiJSQuery<Entity>): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try{
        resolve(!!(await this.__metadata__.collection).findOne(conditions));
      }catch(e){
        reject(e);
      }
    });
  }

  /**
   * Inserts and returns the dto
   * @param dto
   * @param executeSubscribers
   */
  insert(dto: Partial<Entity>, executeSubscribers: boolean = true): Promise<Entity> {
    return new Promise<Entity>(async (resolve, reject) => {
      try{
        // save the dto as entity
        let entity = dto;
        
        // execute the subscribers assigned to the entity
        for(let subscriber of this.__metadata__.subscribers.filter(s => executeSubscribers && isFunction(s.beforeInsert))){
          entity = (await subscriber.beforeInsert(dto as Entity)) || entity;
        }

        // format the columns of the entity
        entity = await this.prepareEntityForInsert(entity);
        
        // insert the entity into the database
        entity = await this.__metadata__.collection.insert(entity);
        
        // clone the entity to prevent direct changes to the database
        entity = this.cloneEntity(entity);

        // execute the subscribers assigned to the entity
        for(let subscriber of this.__metadata__.subscribers.filter(s => executeSubscribers && isFunction(s.afterInsert))){
          entity = (await subscriber.afterInsert(entity as Entity)) || entity;
        }

        // commit database
        await this.commit();

        // return the entity
        resolve(entity as Entity);
        
      }catch(e){
        reject(e);
      }
    });
  }

  /**
   * Validates and formats all columns in the entity
   * @param dto
   * @private
   */
  private prepareEntityForInsert(dto: Partial<Entity>): Promise<Entity> {
    return new Promise<Entity>(async (resolve, reject) => {
      try{

        // resolve entity if columns are empty
        if(!this.__metadata__.columns?.length){
          return resolve(this.create(dto));
        }

        // create new entity
        const entity = this.create();

        // prepare columns
        for(let column of this.__metadata__.columns){
          let value = !isNil(dto?.[column.name]) ? dto[column.name] :  null;

          if(isNil(value) && !isNil(column.default)){
            value = isFunction(column.default) ? await column.default() : column.default;
          }

          if(isNil(value) && !column.options?.nullable){
            throw new LokiJSInputValidationNotNullableError(entity['name'], column.name);
          }

          if(isFunction(column?.validator) && !await column.validator(column.options || {}, value)){
            throw new LokiJSInputValidationError(`Value does not meet the requirements of column "${entity['name']}.${column.type}"`);
          }

          if(isFunction(column?.onInsert)){
            value = await column.onInsert(column.options || {}, value);
          }

          entity[column.name] = value;
        }

        // execute onInsertFull
        for(let column of this.__metadata__.columns){
          let value = entity[column.name];
          if(isFunction(column?.onInsertFull)){
            value = await column.onInsertFull(column.options || {}, value);
          }
          entity[column.name] = value;
        }

        // commit database
        await this.commit();

        // resolve entity
        resolve(entity);

      }catch(e){
        reject(e);
      }
    });
  }

  /**
   * Updates all entity matching the provided conditions
   * @param conditions
   * @param dto
   * @param executeSubscribers
   */
  update(conditions: ILokiJSQuery<Entity>, dto: Partial<Entity>, executeSubscribers: boolean = true): Promise<Entity[]> {
    return new Promise<Entity[]>(async (resolve, reject) => {
      try{
        // get all entities that matches the provided conditions
        const entities: Entity[] = this.__metadata__.collection.find(conditions);
        
        // create array for all updated entities
        const updated: Entity[] = [];
        
        // process entities
        for(let entity of entities){
          // clone entity to prevent direct changes to the database
          const databaseEntity = this.cloneEntity(entity);
          
          // execute subscribers assigned to the entity
          for(let subscriber of this.__metadata__.subscribers.filter(s => executeSubscribers && isFunction(s.beforeUpdate))){
            dto = (await subscriber.beforeUpdate(dto as Entity, databaseEntity)) || dto;
          }

          // format the columns of the entity
          entity = await this.prepareEntityForUpdate(entity, dto, databaseEntity);

          // update entity
          entity = await this.__metadata__.collection.update(entity);

          // clone the entity to prevent direct changes to the database
          entity = this.cloneEntity(entity);

          // execute subscribers assigned to the entity
          for(let subscriber of this.__metadata__.subscribers.filter(s => executeSubscribers && isFunction(s.afterUpdate))){
            entity = (await subscriber.afterUpdate(entity as Entity)) || entity;
          }

          // add entity to array
          updated.push(entity);

        }

        // commit database
        await this.commit();

        // return updated entities
        resolve(updated);

      }catch(e){
        reject(e);
      }
    });
  }

  /**
   * Validates and formats all columns in the entity
   * @private
   * @param entity
   * @param dto
   * @param databaseEntity
   */
  private prepareEntityForUpdate(entity: Entity, dto: Partial<Entity>, databaseEntity: Entity): Promise<Entity> {
    return new Promise<Entity>(async (resolve, reject) => {
      try{

        // get columns
        const columns = this.__metadata__.columns;
        const dtoColumns = Object.keys(dto || {}).filter(column => columns.filter(c => c.name === column).length);

        // prepare columns
        for(let colName of dtoColumns){
          let column = columns.find(c => c.name === colName);
          let value = !isNil(dto?.[colName]) ? dto[colName] : null;

          if(isNil(value) && !column.options?.nullable){
            throw new LokiJSInputValidationNotNullableError(entity['name'], column.name);
          }

          if(isFunction(column?.validator) && !await column.validator(column.options || {}, value)){
            throw new LokiJSInputValidationError(`Value does not meet the requirements of column "${entity['name']}.${column.type}"`);
          }

          if(isFunction(column?.onUpdate)){
            value = await column.onUpdate(column.options || {}, value, databaseEntity[column.name]);
          }

          entity[column.name] = value;
        }

        // execute onUpdateFull
        for(let column of columns){
          let value = entity[column.name];
          if(isFunction(column?.onUpdateFull)){
            value = await column.onUpdateFull(column.options || {}, dto, databaseEntity);
          }
          entity[column.name] = value;
        }

        // commit database
        await this.commit();

        // resolve entity
        resolve(entity);

      }catch(e){
        reject(e);
      }
    });
  }

  /**
   * Deletes all entities that matches the conditions
   * @param conditions
   * @param executeSubscribers
   */
  delete(conditions: ILokiJSQuery<Entity>, executeSubscribers: boolean = false): Promise<Entity[]> {
    return new Promise<Entity[]>(async (resolve, reject) => {
      try{
        // get all entities that matches the provided conditions
        const entities: Entity[] = this.__metadata__.collection.find(conditions);

        // create array for all deleted entities
        const deleted: Entity[] = [];

        // process entities
        for(let entity of entities) {
          // delete entity in the database
          await this.__metadata__.collection.remove(entity);

          // clone entity to prevent direct changes to the database
          entity = this.cloneEntity(entity);

          // run subscribers that are assigned to the entity
          for(let subscriber of this.__metadata__.subscribers.filter(s => executeSubscribers && isFunction(s.afterDelete))){
            entity = (await subscriber.afterDelete(entity)) || entity;
          }

          // add entity to array
          deleted.push(entity);
        }

        // commit database
        await this.commit();

        // resolve deleted
        resolve(deleted);

      }catch(e){
        reject(e);
      }
    });
  }

  /**
   * Saves the collection
   */
  private commit(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      this.__metadata__.database.saveDatabase((error) => error ? reject(error) : resolve());
    });
  }

  /**
   * Clones the entity to prevent direct changes to the database
   * @param data
   * @internal
   * @private
   */
  private cloneEntity<Entity extends object = any>(data: Entity): Entity {
    if(!isNil(data) && !Array.isArray(data) && typeof data === 'object'){
      data = cloneDeep(data);
      for(let key of ['$loki']){
        if(Object.keys(data).includes(key)){
          delete data[key];
        }
      }
    }
    return data;
  }
}