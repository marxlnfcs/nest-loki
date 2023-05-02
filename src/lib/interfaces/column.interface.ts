import {LokiJSInputValidationError} from "../exceptions/input-validation-error.exception";

export type ILokiJSColumnType = 'Id'|'Text'|'Number'|'Boolean'|'Date'|'Array'|'KeyValue'|'Json'|'Updated'|'Created'|string;
export type ILokiJSColumnDefault<DefaultValue = any> = DefaultValue|null|ILokiJSColumnDefaultFunction<DefaultValue>;
export type ILokiJSColumnDefaultFunction<DefaultValue = any> = () => DefaultValue|null|Promise<DefaultValue>;
export interface ILokiJSColumnOptions<DefaultValue = any> {
  nullable?: boolean;
  unique?: boolean;
  indices?: boolean;
  default?: ILokiJSColumnDefault;
}

export interface ILokiJSColumn<Options extends ILokiJSColumnOptions = ILokiJSColumnOptions, Value = any> {
  type: ILokiJSColumnType;
  name: string|symbol;
  options?: Options;
  default?: ILokiJSColumnDefault;
  validator?: (options: Options, value: Value|null) => true|LokiJSInputValidationError|Promise<true|LokiJSInputValidationError>;
  onRead?: (options: Options, value: Value|null) => Value|null|Promise<Value|null>;
  onInsert?: (options: Options, value: Value|null) => Value|null|Promise<Value|null>;
  onInsertFull?: (options: Options, entity: object) => Value|null|Promise<Value|null>;
  onUpdate?: (options: Options, value: Value|null, databaseValue: Value|null) => Value|null|Promise<Value|null>;
  onUpdateFull?: (options: Options, entity: object, databaseValue: object) => Value|null|Promise<Value|null>;
}

export interface ILokiJSColumnIdOptions {}
export interface ILokiJSColumnTextOptions extends ILokiJSColumnOptions<string> {
  minLength?: number;
  maxLength?: number;
}
export interface ILokiJSColumnNumberOptions extends ILokiJSColumnOptions<number> {
  min?: number;
  max?: number;
}
export interface ILokiJSColumnBooleanOptions extends ILokiJSColumnOptions<boolean> {}
export interface ILokiJSColumnDateOptions extends ILokiJSColumnOptions<Date> {
  min?: Date;
  max?: Date;
}
export interface ILokiJSColumnArrayOptions extends ILokiJSColumnOptions<any[]> {}
export interface ILokiJSColumnObjectOptions extends ILokiJSColumnOptions<object> {}
export interface ILokiJSColumnJsonOptions extends ILokiJSColumnOptions {}
export interface ILokiJSColumnUpdatedOptions {
  includeColumns?: string[];
  excludeColumns?: string[];
}
export interface ILokiJSColumnCreatedOptions {}