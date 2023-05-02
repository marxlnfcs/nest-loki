/** @internal */
export function createClassDecorator(decorator: ClassDecorator): ClassDecorator {
  return (target: any) => decorator(target);
}

/** @internal */
export function createPropertyDecorator(decorator: PropertyDecorator): PropertyDecorator {
  return (target: any, propertyKey: string|symbol) => decorator(target, propertyKey);
}