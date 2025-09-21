export abstract class Option<T> {
  abstract isSome(): this is Some<T>;
  abstract isNone(): this is None<T>;

  // map a value if it exists
  abstract map<U>(f: (value: T) => U): Option<U>;

  // flatMap: expects a function returning another Option
  abstract flatMap<U>(f: (value: T) => Option<U>): Option<U>;

  // unwrapOr: return the value or a default
  abstract unwrapOr(defaultValue: T): T;

  // orElse: provide another Option lazily
  abstract orElse(f: () => Option<T>): Option<T>;

  // match: pattern matching
  abstract match<U>(branches: { some: (value: T) => U; none: () => U }): U;
}

export class Some<T> extends Option<T> {
  constructor(private readonly value: T) {
    super();
  }

  isSome(): this is Some<T> {
    return true;
  }
  isNone(): this is None<T> {
    return false;
  }

  map<U>(f: (value: T) => U): Option<U> {
    return new Some(f(this.value));
  }

  flatMap<U>(f: (value: T) => Option<U>): Option<U> {
    return f(this.value);
  }

  unwrapOr(_defaultValue: T): T {
    return this.value;
  }

  orElse(_f: () => Option<T>): Option<T> {
    return this;
  }

  match<U>(branches: { some: (value: T) => U; none: () => U }): U {
    return branches.some(this.value);
  }
}

export class None<T> extends Option<T> {
  isSome(): this is Some<T> {
    return false;
  }
  isNone(): this is None<T> {
    return true;
  }

  map<U>(_f: (value: T) => U): Option<U> {
    return new None<U>();
  }

  flatMap<U>(_f: (value: T) => Option<U>): Option<U> {
    return new None<U>();
  }

  unwrapOr(defaultValue: T): T {
    return defaultValue;
  }

  orElse(f: () => Option<T>): Option<T> {
    return f();
  }

  match<U>(branches: { some: (value: T) => U; none: () => U }): U {
    return branches.none();
  }
}

// --- convenience constructors ---
export const some = <T>(value: T) => new Some(value);
export const none = <T>() => new None<T>();
