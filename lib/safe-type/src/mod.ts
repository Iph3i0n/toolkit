export type IsType<T> = T extends (arg: unknown) => arg is infer T ? T : never;
export type Checker<T> = (arg: unknown) => arg is T;

type CheckerObject = { [key: string]: Checker<unknown> };
type ObjectChecker<T extends CheckerObject> = (
  arg: unknown
) => arg is { [TKey in keyof T]: IsType<T[TKey]> };

type Checkerify<T extends unknown[]> = { [TKey in keyof T]: Checker<T[TKey]> };

export function IsString(arg: unknown): arg is string {
  return typeof arg === "string";
}

export function IsNumber(arg: unknown): arg is number {
  return typeof arg === "number";
}

export function IsBigInt(arg: unknown): arg is bigint {
  return typeof arg === "bigint";
}

export function IsSymbol(arg: unknown): arg is symbol {
  return typeof arg === "symbol";
}

export function IsBoolean(arg: unknown): arg is boolean {
  return typeof arg === "boolean";
}

export function IsFunction(arg: unknown): arg is Function {
  return typeof arg === "function";
}

export function IsDate(arg: unknown): arg is Date {
  return arg instanceof Date;
}

export function IsLiteral<T extends string | number | boolean>(
  value: T
): (arg: unknown) => arg is T {
  return (arg): arg is T => arg === value;
}

export function IsArray<T>(checker: Checker<T>): Checker<T[]> {
  return (arg): arg is T[] => {
    if (!Array.isArray(arg)) {
      return false;
    }

    return !arg.find((a, i) => {
      const result = checker(a);
      if (!result) {
        return true;
      }

      return false;
    });
  };
}

export function IsIterable<T extends unknown>(
  checker: Checker<T>
): Checker<Iterable<T>> {
  return (arg): arg is Iterable<T> => {
    if (!arg) return false;
    if (typeof arg !== "object") return false;

    if (!(arg as any)[Symbol.iterator]) {
      return false;
    }

    for (const part of arg as Iterable<unknown>) {
      if (!checker(part)) return false;
    }

    return true;
  };
}

export function IsTuple<T extends unknown[]>(...checkers: Checkerify<T>) {
  return (arg: unknown): arg is T => {
    if (!Array.isArray(arg)) return false;
    if (arg.length !== checkers.length) return false;
    return checkers.find((v, i) => !v(arg[i])) == null;
  };
}

export function IsUnion<T extends unknown[]>(
  ...checkers: { [K in keyof T]: Checker<T[K]> }
) {
  return (arg: unknown): arg is T[number] =>
    checkers.filter((c) => c(arg)).length > 0;
}

export function IsOneOf<T extends Array<string | number | boolean>>(
  ...options: T
) {
  return (arg: unknown): arg is T[number] => {
    for (const item of options) if (IsLiteral(item)(arg)) return true;

    return false;
  };
}

type UnionToIntersection<T extends unknown[]> = T extends [infer F, ...infer R]
  ? F & UnionToIntersection<R>
  : unknown;

export function IsIntersection<T extends unknown[]>(
  ...checkers: { [K in keyof T]: Checker<T[K]> }
) {
  return (arg: unknown): arg is UnionToIntersection<T> => {
    for (const checker of checkers) if (!checker(arg)) return false;
    return true;
  };
}

export function IsObject<T extends CheckerObject>(
  checker: T
): ObjectChecker<T> {
  return ((arg: unknown) => {
    if (!arg || typeof arg !== "object") return false;

    for (const key in checker) {
      if (!IsKeyOf(checker, key)) continue;
      if (!checker[key]((arg as any)[key])) {
        return false;
      }
    }

    return true;
  }) as ObjectChecker<T>;
}

export function IsRecord<TKey extends string | symbol, T>(
  keys: Checker<TKey>,
  checker: Checker<T>
): Checker<Record<TKey, T>> {
  return (arg: unknown): arg is Record<TKey, T> => {
    if (!arg || typeof arg !== "object") return false;
    let any_match = false;

    const is_match = (key: string) =>
      keys(key) && IsKeyOf(arg as any, key) && checker((arg as any)[key]);

    for (const key in arg ?? {}) if (!is_match(key)) return false;

    return true;
  };
}

export function IsDictionary<T>(c: Checker<T>): Checker<{ [key: string]: T }> {
  return IsRecord(IsString, c);
}

export function Optional<T>(c: Checker<T>): Checker<T | null | undefined> {
  return (arg: unknown): arg is T | null | undefined => {
    return typeof arg === "undefined" || arg === null || c(arg);
  };
}

export function IsEmpty(arg: unknown): arg is null | undefined {
  return arg === null || arg === undefined;
}

export function DoNotCare(arg: unknown): arg is unknown {
  return true;
}

export function Assert<T>(
  checker: Checker<T>,
  subject: unknown,
  message?: string
): asserts subject is T {
  if (!checker(subject)) {
    throw new Error(
      message ? message : "Invalid type of " + JSON.stringify(subject)
    );
  }
}

type TupleResult<T extends unknown[]> = {
  [K in keyof T]: (item: T[K]) => unknown;
};

export function PatternMatch<T extends unknown[]>(...checkers: Checkerify<T>) {
  return <TResult extends TupleResult<T>>(...handlers: TResult) => {
    if (handlers.length !== checkers.length)
      throw new Error("Handlers and chekers must have the same length");

    return (item: T[number]): ReturnType<TResult[number]> => {
      for (let i = 0; i < handlers.length; i++) {
        const checker = checkers[i];
        const handler = handlers[i];
        if (checker(item)) {
          return handler(item) as any;
        }
      }

      throw new Error("No matching pattern for " + JSON.stringify(item));
    };
  };
}

export function IsKeyOf<T extends object>(
  checker: T,
  subject: string | number | symbol
): subject is keyof T {
  return subject in checker && checker.hasOwnProperty(subject);
}

export function IsInstanceOf<T>(constructor: new (...args: any[]) => T) {
  return (arg: unknown): arg is T => arg instanceof constructor;
}
