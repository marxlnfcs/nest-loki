export class LokiJSInputValidationError extends Error {
  constructor(message: string){
    super(message);
  }
}

export class LokiJSInputValidationExpressionError extends LokiJSInputValidationError {
  constructor(entityName: string, columnName: string|symbol, message: string){
    super(`${entityName}.${columnName.toString()}: ${message}`);
  }
}

export class LokiJSInputValidationNotNullableError extends LokiJSInputValidationError {
  constructor(entityName: string, columnName: string|symbol){
    super(`The column "${entityName}.${columnName.toString()}" can't be empty.`);
  }
}

export class LokiJSInputValidationWrongTypeError extends LokiJSInputValidationError {
  constructor(entityName: string, columnName: string|symbol, expectedType: string, isType: string){
    super(`The column "${entityName}.${columnName.toString()}" must be type of "${expectedType}" but is "${isType}"`);
  }
}