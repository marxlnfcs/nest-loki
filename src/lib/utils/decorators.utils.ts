/** @internal */
export function createClassDecorator(decorator: ClassDecorator): ClassDecorator {
  return (target: any) => decorator(target);
}

/** @internal */
export function createPropertyDecorator(decorator: PropertyDecorator): PropertyDecorator {
  return (target: any, propertyKey: string|symbol) => decorator(target, propertyKey);
}

/** @internal */
export function createConstructor(construct: (instance: any, args: any[]) => void): ClassDecorator {
  return (target: any): any => {
    const original = target;
    const constructor: any = function(...args: any[]) {
      const instance = new original(...args);
      construct(instance, args);
      return instance;
    }
    constructor.prototype = original.prototype;
    return constructor;
  };
}