export function b<T>(factory: () => T) {
  let instance: T;

  return () => {
    if (!instance) instance = factory();

    return instance;
  };
}
