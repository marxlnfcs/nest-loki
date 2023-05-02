export type ILokiJSEquals = { $eq: any };
export function lokiEquals(value: any): ILokiJSEquals {
  return { $eq: value };
}

export type ILokiJSNotEquals = { $ne: any };
export function lokiNotEquals(value: any): ILokiJSNotEquals {
  return { $ne: value };
}

export type ILokiJSGreaterThen = { $gt: any };
export function lokiGreaterThan(value: number): ILokiJSGreaterThen {
  return { $gt: value };
}

export type ILokiJSGreaterOrEqualThen = { $gte: any };
export function lokiGreaterOrEqualThan(value: number): ILokiJSGreaterOrEqualThen {
  return { $gte: value };
}

export type ILokiJSLessThen = { $lt: any };
export function lokiLessThan(value: number): ILokiJSLessThen {
  return { $lt: value };
}

export type ILokiJSLessOrEqualThen = { $lte: any };
export function lokiLessOrEqualThan(value: number): ILokiJSLessOrEqualThen {
  return { $lte: value };
}

export type ILokiJSBetween = { $between: number[] };
export function lokiBetween(values: number[]): ILokiJSBetween {
  return { $between: values };
}

export type ILokiJSMatch = { $regex: RegExp };
export function lokiMatch(regex: RegExp): ILokiJSMatch {
  return { $regex: regex };
}

export type ILokiJSIn = { $in: any[] };
export function lokiIn(arr: any[]): ILokiJSIn {
  return { $in: arr };
}

export type ILokiJSContains = { $contains: any };
export function lokiContains(contains: any): ILokiJSContains {
  return { $contains: contains };
}

export type ILokiJSContainsAny = { $containsAny: any[] };
export function lokiContainsAny(contains: any[]): ILokiJSContainsAny {
  return { $containsAny: contains };
}

export type ILokiJSContainsNone = { $containsNone: any[] };
export function lokiContainsNone(contains: any[]): ILokiJSContainsNone {
  return { $containsNone: contains };
}