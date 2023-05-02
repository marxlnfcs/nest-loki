import {applyDecorators} from "@nestjs/common";
import {createPropertyDecorator} from "../utils/decorators.utils";
import {FeatureAddCollectionEntityColumn} from "../utils/lokijs.utils";
import {
  ILokiJSColumnArrayOptions,
  ILokiJSColumnBooleanOptions,
  ILokiJSColumnCreatedOptions,
  ILokiJSColumnDateOptions,
  ILokiJSColumnIdOptions,
  ILokiJSColumnJsonOptions,
  ILokiJSColumnNumberOptions,
  ILokiJSColumnObjectOptions,
  ILokiJSColumnTextOptions,
  ILokiJSColumnUpdatedOptions
} from "../interfaces/column.interface";
import {v4 as createUUID} from 'uuid';
import {
  LokiJSInputValidationExpressionError,
  LokiJSInputValidationWrongTypeError
} from "../exceptions/input-validation-error.exception";

export function LokiColumnId(options?: ILokiJSColumnIdOptions): PropertyDecorator {
  return applyDecorators(
    createPropertyDecorator((target, columnName) => FeatureAddCollectionEntityColumn<ILokiJSColumnIdOptions, string>(target, {
      type: 'Id',
      name: columnName,
      options: {
        ...(options || {}),
        nullable: false,
        unique: true,
        indices: true,
      },
      default: () => createUUID(),
      onUpdate: (options, value, databaseValue) => databaseValue,
    })),
  );
}

export function LokiColumnText(options?: ILokiJSColumnTextOptions): PropertyDecorator {
  return applyDecorators(
    createPropertyDecorator((target, columnName) => FeatureAddCollectionEntityColumn<ILokiJSColumnTextOptions>(target, {
      type: 'Text',
      name: columnName,
      options: options || {},
      default: options?.default,
      validator: (options, value) => {
        if(value !== undefined && value !== null){
          switch(true) {
            case (typeof value !== 'string'):
              return new LokiJSInputValidationWrongTypeError(columnName, 'string', typeof value);
            case (options?.minLength && value.length < options.minLength):
              return new LokiJSInputValidationExpressionError(columnName, `Text length needs to be less or equal ${options.minLength}`);
            case (options?.maxLength && value.length > options.maxLength):
              return new LokiJSInputValidationExpressionError(columnName, `Text length needs to be larger or equal ${options.minLength}`);
          }
        }
        return true;
      },
    })),
  );
}

export function LokiColumnNumber(options?: ILokiJSColumnNumberOptions): PropertyDecorator {
  return applyDecorators(
    createPropertyDecorator((target, columnName) => FeatureAddCollectionEntityColumn<ILokiJSColumnNumberOptions>(target, {
      type: 'Number',
      name: columnName,
      options: options || {},
      default: options?.default,
      validator: (options, value) => {
        if(value !== undefined && value !== null){
          switch(true){
            case typeof value !== 'number':
              return new LokiJSInputValidationWrongTypeError(columnName, 'number', typeof value);
            case (options?.min && value < options.min):
              return new LokiJSInputValidationExpressionError(columnName, `Number needs to be less or equal ${options.min}`);
            case (options?.max && value > options.max):
              return new LokiJSInputValidationExpressionError(columnName, `Number needs to be larger or equal ${options.max}`);
          }
        }
        return true;
      }
    })),
  );
}

export function LokiColumnBoolean(options?: ILokiJSColumnBooleanOptions): PropertyDecorator {
  return applyDecorators(
    createPropertyDecorator((target, columnName) => FeatureAddCollectionEntityColumn<ILokiJSColumnBooleanOptions>(target, {
      type: 'Boolean',
      name: columnName,
      options: options || {},
      default: options?.default,
      validator: (options, value) => {
        if(value !== undefined && value !== null){
          switch(true) {
            case (typeof value !== 'boolean'):
              return new LokiJSInputValidationWrongTypeError(columnName, 'boolean', typeof value);
          }
        }
        return true;
      },
    })),
  );
}

export function LokiColumnDate(options?: ILokiJSColumnDateOptions): PropertyDecorator {
  return applyDecorators(
    createPropertyDecorator((target, columnName) => FeatureAddCollectionEntityColumn<ILokiJSColumnDateOptions>(target, {
      type: 'Number',
      name: columnName,
      options: options || {},
      default: options?.default,
      validator: (options, value) => {
        if(value !== undefined && value !== null){
          switch(true){
            case !(value instanceof Date):
              return new LokiJSInputValidationWrongTypeError(columnName, 'Date', typeof value);
            case (options?.min && value.getTime() < options.min.getTime()):
              return new LokiJSInputValidationExpressionError(columnName, `Date must to be less or equal ${options.min.toString()}`);
            case (options?.max && value.getTime() > options.max.getTime()):
              return new LokiJSInputValidationExpressionError(columnName, `Date must to be larger or equal ${options.max.toString()}`);
          }
        }
        return true;
      },
      onRead: (options, value) => value ? new Date(value) : null,
    })),
  );
}

export function LokiColumnArray(options?: ILokiJSColumnArrayOptions): PropertyDecorator {
  return applyDecorators(
    createPropertyDecorator((target, columnName) => FeatureAddCollectionEntityColumn<ILokiJSColumnArrayOptions>(target, {
      type: 'Array',
      name: columnName,
      options: options || {},
      default: options?.default,
      validator: (options, value) => {
        if(value !== undefined && value !== null){
          switch(true){
            case !Array.isArray(value): return new LokiJSInputValidationWrongTypeError(columnName, 'object', typeof value);
          }
        }
        return true;
      }
    })),
  );
}

export function LokiColumnObject(options?: ILokiJSColumnObjectOptions): PropertyDecorator {
  return applyDecorators(
    createPropertyDecorator((target, columnName) => FeatureAddCollectionEntityColumn<ILokiJSColumnObjectOptions>(target, {
      type: 'KeyValue',
      name: columnName,
      options: options || {},
      default: options?.default,
      validator: (options, value) => {
        if(value !== undefined && value !== null){
          switch(true){
            case Array.isArray(value): return new LokiJSInputValidationWrongTypeError(columnName, 'object', 'array');
            case typeof value !== 'object': return new LokiJSInputValidationWrongTypeError(columnName, 'object', typeof value);
          }
        }
        return true;
      }
    })),
  );
}

export function LokiColumnJson(options?: ILokiJSColumnJsonOptions): PropertyDecorator {
  return applyDecorators(
    createPropertyDecorator((target, columnName) => FeatureAddCollectionEntityColumn<ILokiJSColumnJsonOptions>(target, {
      type: 'Json',
      name: columnName,
      options: options || {},
      default: options?.default,
      validator: (options, value) => {
        if(value !== undefined && value !== null){
          if(typeof value !== 'string' || typeof value !== 'object'){
            return new LokiJSInputValidationWrongTypeError(columnName, 'object|string', typeof value);
          }
        }
        return true;
      },
      onRead: (options, value) => {
        if(value !== undefined && value !== null){
          try{
            switch(typeof value){
              case 'string': return JSON.parse(value);
              case 'object': return value;
            }
            return null;
          }catch{
            return null;
          }
        }
        return null;
      },
    })),
  );
}

export function LokiColumnUpdated(options?: ILokiJSColumnUpdatedOptions): PropertyDecorator {
  return applyDecorators(
    createPropertyDecorator((target, columnName) => FeatureAddCollectionEntityColumn<ILokiJSColumnUpdatedOptions>(target, {
      type: 'Updated',
      name: columnName,
      options: {
        ...(options || {}),
        nullable: true,
        unique: false,
        indices: false,
      },
      validator: (options, value) => {
        if(value !== undefined && value !== null) {
          if (!(value instanceof Date)) {
            return new LokiJSInputValidationWrongTypeError(columnName, 'date', typeof value);
          }
        }
        return true;
      },
      onUpdateFull: (options, entity, databaseEntity) => {
        const included: (string|symbol)[] = options?.includeColumns || [];
        const excluded: (string|symbol)[] = [ columnName, ...(options?.excludeColumns || []) ];
        const columns = Object.keys(entity).filter(column => (!included.length || included.includes(column) && (!excluded.length || !excluded.includes(column))));
        for(let column of columns){
          const entityValue = (entity[column] !== undefined && entity[column] !== null) ? JSON.stringify(entity[column]) : null;
          const databaseValue = (databaseEntity[column] !== undefined && databaseEntity[column] !== null) ? JSON.stringify(databaseEntity[column]) : null;
          if(entityValue !== databaseValue){
            return new Date();
          }
        }
        return databaseEntity[columnName] || null;
      }
    })),
  );
}

export function LokiColumnCreated(options?: ILokiJSColumnCreatedOptions): PropertyDecorator {
  return applyDecorators(
    createPropertyDecorator((target, columnName) => FeatureAddCollectionEntityColumn<ILokiJSColumnCreatedOptions>(target, {
      type: 'Created',
      name: columnName,
      default: () => new Date(),
      options: {
        ...(options || {}),
        nullable: false,
        unique: false,
        indices: false,
      },
      validator: (options, value) => {
        if(value !== undefined && value !== null) {
          if (!(value instanceof Date)) {
            return new LokiJSInputValidationWrongTypeError(columnName, 'date', typeof value);
          }
        }
        return true;
      }
    })),
  );
}