export type Option<T> = { isSome: true; value: T } | { isSome: false };

export function some<T>(value: T): Option<T> {
  return { isSome: true, value };
}

export function none<T>(): Option<T> {
  return { isSome: false };
}
