# LokiJS-ORM Module for NestJS

[![npm](https://ico.y.gy/npm/dm/@marxlnfcs/nest-lokijs?style=flat-square&logo=npm)](https://www.npmjs.com/package/@marxlnfcs/nest-lokijs)
[![NPM](https://ico.y.gy/npm/l/@marxlnfcs/nest-lokijs?style=flat-square&color=brightgreen)](https://www.npmjs.com/package/@marxlnfcs/nest-lokijs)
[![Snyk Vulnerabilities for npm package](https://ico.y.gy/snyk/vulnerabilities/npm/@marxlnfcs/nest-lokijs?style=flat-square&logo=snyk)](https://snyk.io/test/npm/@marxlnfcs/nest-lokijs)
[![Website](https://ico.y.gy/website?down_color=red&down_message=offline&label=repository&up_color=success&up_message=online&url=https%3A%2F%2Fgithub.com%2Fmarxlnfcs%2Fnest-lokijs&style=flat-square&logo=github)](https://github.com/marxlnfcs/nest-lokijs)

> **Warning**
> This library is for experimentation and may contain some bugs that I will remove from time to time.
> With this library I'm learning how dependency injection works and how to build such libraries according to "best practice".
>
> So please use this library with caution.

## Installation
```
npm i @marxlnfcs/nest-lokijs
```

## Usage
### AppModule
```javascript
@Module({
    imports: [
        LokiJSModule.forRoot({
            ...
        }),
        LokiJSModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                ...
            }),
            inject: [ConfigService]
        })
    ]
})
export class AppModule {}

```

## Patterns
### Entity
The entity is a model definition, that will be stored in the database.
```javascript
// ------------------------------
// entities/test.entity.ts
import {LokiEntity} from '@marxlnfcs/nest-lokijs';
import {LokiColumnBoolean, LokiColumnCreated, LokiColumnId, LokiColumnText, LokiColumnUpdated} from "../src/lib/decorators/column.decorator";

@LokiEntity('<collection-name>')
export class TestEntity {
    @LokiColumnId()
    id: string;

    @LokiColumnText()
    name: string;

    @LokiColumnText({ nullable: true })
    source: string|null;

    @LokiColumnBoolean({ default: false })
    enabled: boolean;

    @LokiColumnUpdated()
    updated: Date;

    @LokiColumnCreated()
    created: Date;
}

// ------------------------------
// app.module.ts
import {LokiJSModule} from '@marxlnfcs/nest-lokijs';

@Module({
    imports: [
        LokiJSModule.forFeature(TestEntity)
    ]
})
export class AppModule {}
```

---
### Repository
The repository helps you to fetch the data from the database. This class works like a service and you can use the dependency injection.
```javascript
// ------------------------------
// repositories/test.repository.ts
import {LokiRepository, LokiJSRepository} from '@marxlnfcs/nest-lokijs';
import {TestEntity} from '../entities/test.entity.ts';

@LokiRepository(TestEntity)
export class TestRepository extends LokiJSRepository<TestEntity> {}

// ------------------------------
// app.module.ts
import {LokiJSModule} from '@marxlnfcs/nest-lokijs';

@Module({
  imports: [
    LokiJSModule.forFeature(TestRepository)
  ]
})
export class AppModule {}
```

---
### Repository
The subscriber can be assigned to any entity. The subscriber's function is to manipulate the entities before they are returned from the repository or written to the database.
```javascript
// ------------------------------
// subscribers/test.subscriber.ts
import {LokiSubscriber, Loki} from '@marxlnfcs/nest-lokijs';
import {TestEntity} from '../entities/test.entity.ts';

@LokiSubscriber(TestEntity)
export class TestSubscriber extends ILokiJSSubscriber<TestEntity> {
    afterLoad(entity: TestEntity): Promise<TestEntity> | Promise<void> | void | TestEntity {}
    beforeInsert(entity: TestEntity): Promise<TestEntity> | Promise<void> | void | TestEntity {}
    afterInsert(entity: TestEntity): Promise<TestEntity> | Promise<void> | void | TestEntity {}
    beforeUpdate(entity: TestEntity, databaseEntity: TestEntity): Promise<TestEntity> | Promise<void> | void | TestEntity {}
    afterUpdate(entity: TestEntity): Promise<TestEntity> | Promise<void> | void | TestEntity {}
    afterDelete(entity: TestEntity): Promise<TestEntity> | Promise<void> | void | TestEntity {}
}

// ------------------------------
// app.module.ts
import {LokiJSModule} from '@marxlnfcs/nest-lokijs';

@Module({
    imports: [
        LokiJSModule.forFeature(TestSubscriber)
    ]
})
export class AppModule {}
```