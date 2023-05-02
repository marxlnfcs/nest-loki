import {INestApplication} from "@nestjs/common";
import {TestingModule} from "@nestjs/testing";
import {createTestModule, TestEntity, TestRepository} from "./test.module";
import {lokiEquals} from "../src/lib/utils/comparator.utils";
import {deleteCollections} from "../src/lib/lokijs.storage";

describe('Testing Library', () => {
  let app: INestApplication;
  let repository: TestRepository;
  let entity: TestEntity;

  // resolve test module
  beforeAll(async () => {
    const module: TestingModule = await createTestModule();

    app = module.createNestApplication();
    await app.init();
  });

  // check if the custom repository can be injected
  describe('Inject Repositories', () => {
    it('should return the TestRepository instance', async () => {
      repository = await app.get(TestRepository);
      expect(repository).toBeTruthy();
    });
  });

  // check if the entity will be created with the repository
  describe('Create Entities', () => {
    it('should create a new entity in the database', async () => {
      entity = repository.create({ name: repository.constructor.name });
      entity = await repository.insert(entity);
      expect(entity).toBeTruthy();
    });
  });

  // get entities
  describe('Get Entities', () => {
    it('should output a list of all entities', async () => {
      const entities = await repository.find();
      expect(entities).toBeTruthy();
    });
  });

  // check if the entity will be updated with the repository
  describe('Update Entities', () => {
    it('should update an entity in the database', async () => {
      const updated = await repository.update({ name: lokiEquals(entity.name) }, { source: repository.constructor.name });
      expect(updated).toBeTruthy();
    });
  });

  // check if the entity will be deleted with the repository
  describe('Delete Entities', () => {
    it('should delete an entity in the database', async () => {
      const deleted = await repository.delete({ name: lokiEquals(entity.name) });
      expect(deleted).toBeTruthy();
    });
  });

  // close test module
  afterAll(async () => {
    await deleteCollections();
    await app?.close();
  });

});