export interface ILokiJSSubscriber<Entity extends object = any> {
  afterLoad?(entity: Entity): Promise<Entity>|Promise<void>|Entity|void;
  beforeInsert?(entity: Entity): Promise<Entity>|Promise<void>|Entity|void;
  afterInsert?(entity: Entity): Promise<Entity>|Promise<void>|Entity|void;
  beforeUpdate?(entity: Entity, databaseEntity: Entity): Promise<Entity>|Promise<void>|Entity|void;
  afterUpdate?(entity: Entity): Promise<Entity>|Promise<void>|Entity|void;
  afterDelete?(entity: Entity): Promise<Entity>|Promise<void>|Entity|void;
}