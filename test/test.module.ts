import {Test, TestingModule} from "@nestjs/testing";
import {LokiJSModule} from "../src/lib/lokijs.module";
import {LokiEntity} from "../src/lib/decorators/entity.decorator";
import {LokiSubscriber} from "../src/lib/decorators/subscriber.decorator";
import {ILokiJSSubscriber} from "../src/lib/interfaces/subscriber.interface";
import {LokiRepository} from "../src/lib/decorators/repository.decorator";
import {LokiJSRepository} from "../src/lib/models/repository.model";
import {
  LokiColumnBoolean,
  LokiColumnCreated,
  LokiColumnId,
  LokiColumnText,
  LokiColumnUpdated
} from "../src/lib/decorators/column.decorator";

export function createTestModule(): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [
      LokiJSModule.forRoot({
        persistenceMethod: 'fs',
        persistenceDataDir: 'test/data',
        encrypted: true,
        encryptedSecret: 'sup3r-s3cr3t-3ncryption-k3y'
      }),
      LokiJSModule.forFeature([
        TestEntity,
        TestRepository,
        TestSubscriber,
      ]),
    ]
  }).compile();
}

@LokiEntity('testing-collection')
export class TestEntity {
  @LokiColumnId()
  id: string;

  @LokiColumnText()
  name: string;

  @LokiColumnText({ nullable: true })
  source: string|null;

  @LokiColumnBoolean({ default: false })
  default: boolean;

  @LokiColumnUpdated()
  updated: Date;

  @LokiColumnCreated()
  created: Date;

  @LokiColumnText({ nullable: true })
  extras: string|null;
}

@LokiSubscriber(TestEntity)
export class TestSubscriber implements ILokiJSSubscriber<TestEntity> {
  afterLoad(entity: TestEntity): Promise<TestEntity> | Promise<void> | void | TestEntity {

  }
  beforeInsert(entity: TestEntity): Promise<TestEntity> | Promise<void> | void | TestEntity {

  }
  afterInsert(entity: TestEntity): Promise<TestEntity> | Promise<void> | void | TestEntity {

  }
  beforeUpdate(entity: TestEntity, databaseEntity: TestEntity): Promise<TestEntity> | Promise<void> | void | TestEntity {

  }
  afterUpdate(entity: TestEntity): Promise<TestEntity> | Promise<void> | void | TestEntity {

  }
  afterDelete(entity: TestEntity): Promise<TestEntity> | Promise<void> | void | TestEntity {

  }
}

@LokiRepository(TestEntity)
export class TestRepository extends LokiJSRepository<TestEntity> {}