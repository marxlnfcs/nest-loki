export class LokiJSException extends Error {
  constructor(message: string){ super(message); }
}

export class LokiJSEntityNotFoundException extends LokiJSException {
  constructor(
    public readonly collection: string,
    public readonly conditions: any
  ){ super('Entity not found') }
}