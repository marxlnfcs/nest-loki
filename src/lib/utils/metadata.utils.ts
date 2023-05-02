import 'reflect-metadata';

/** @internal */
export function getMetadata<T = any>(key: string|symbol, target: any, propertyKey?: string|symbol): T {
  return Reflect.getMetadata(key, target, propertyKey);
}

/** @internal */
export function setMetadata<T = any>(key: string|symbol, value: T, target: any, propertyKey?: string): T {
  Reflect.defineMetadata(key, value, target, propertyKey);
  return getMetadata<T>(key, target, propertyKey);
}