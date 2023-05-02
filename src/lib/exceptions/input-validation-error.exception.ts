export class LokiJSInputValidationError extends Error {
  constructor(message: string){
    super(message);
  }
}

export class LokiJSInputValidationExpressionError extends LokiJSInputValidationError {
  constructor(columnName: string|symbol, message: string){
    super(`${columnName.toString()}: ${message}`);
  }
}

export class LokiJSInputValidationNotNullableError extends LokiJSInputValidationError {
  constructor(columnName: string|symbol){
    super(`The column "${columnName.toString()}" can't be empty.`);
  }
}

export class LokiJSInputValidationWrongTypeError extends LokiJSInputValidationError {
  constructor(columnName: string|symbol, expectedType: string, isType: string){
    super(`The column "${columnName.toString()}" must be type of "${expectedType}" but is "${isType}"`);
  }
}