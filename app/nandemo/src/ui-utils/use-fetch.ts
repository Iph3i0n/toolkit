import { useCallback, useEffect, useState } from "preact/hooks";

export function UseFetch<TSeed, TResult>(
  default_seed: TSeed,
  factory: (seed: TSeed) => Promise<TResult>
) {
  const [seed, set_seed] = useState(default_seed);
  const [value, set_value] = useState<TResult>();

  useEffect(() => {
    set_seed(default_seed);
  }, [default_seed]);

  useEffect(() => {
    factory(seed).then(set_value);
  }, [seed]);

  const reset = useCallback(
    () => factory(seed).then(set_value),
    [seed, factory]
  );

  return [value, set_seed, seed, reset] as const;
}
