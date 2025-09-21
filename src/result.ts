// export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

// export function ok<T>(value: T): Result<T> {
//   return { ok: true, value };
// }

// export function err(error: string = ""): Result<never> {
//   return { ok: false, error };
// }

export abstract class Result<T> {
  abstract isOk(): this is Ok<T>;
  abstract isErr(): this is Err<T>;

  abstract map<U>(f: (value: T) => U): Result<U>;
  abstract flatMap<U>(f: (value: T) => Result<U>): Result<U>;
  abstract unwrapOr(defaultValue: T): T;
  abstract orElse(f: () => Result<T>): Result<T>;
  abstract match<U>(branches: {
    ok: (value: T) => U;
    err: (error: string) => U;
  }): U;
}

// --- Ok implementation ---
export class Ok<T> extends Result<T> {
  constructor(private readonly value: T) {
    super();
  }

  isOk(): this is Ok<T> {
    return true;
  }
  isErr(): this is Err<T> {
    return false;
  }

  map<U>(f: (value: T) => U): Result<U> {
    return new Ok(f(this.value));
  }
  flatMap<U>(f: (value: T) => Result<U>): Result<U> {
    return f(this.value);
  }
  unwrapOr(_defaultValue: T): T {
    return this.value;
  }
  orElse(_f: () => Result<T>): Result<T> {
    return this;
  }
  match<U>(branches: { ok: (value: T) => U; err: (error: string) => U }): U {
    return branches.ok(this.value);
  }
}

// --- Err implementation ---
export class Err<T> extends Result<T> {
  constructor(private readonly error: string) {
    super();
  }

  isOk(): this is Ok<T> {
    return false;
  }
  isErr(): this is Err<T> {
    return true;
  }

  map<U>(_f: (value: T) => U): Result<U> {
    return new Err<U>(this.error);
  }
  flatMap<U>(_f: (value: T) => Result<U>): Result<U> {
    return new Err<U>(this.error);
  }
  unwrapOr(defaultValue: T): T {
    return defaultValue;
  }
  orElse(f: () => Result<T>): Result<T> {
    return f();
  }
  match<U>(branches: { ok: (value: T) => U; err: (error: string) => U }): U {
    return branches.err(this.error);
  }
}

export const ok = <T>(value: T) => new Ok(value);
export const err = <T = never>(error: string = "") => new Err<T>(error);
