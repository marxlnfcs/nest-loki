/** @internal */
export function isNil(data: any): data is null {
  return data === undefined || data === null;
}

/** @internal */
export function isUndefined(data: any): data is undefined {
  return data === undefined;
}

/** @internal */
export function isFunction(data: any): data is Function {
  return typeof data === 'function';
}