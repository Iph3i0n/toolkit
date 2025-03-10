import type { AnyColumns, ColumnModel } from "./column";

export type EntityInput<TColumns extends AnyColumns> = {
  [TKey in keyof TColumns]: ColumnModel<TColumns[TKey]>;
};

export type FindInput<TColumns extends AnyColumns> = Partial<{
  [TKey in keyof TColumns]: ColumnModel<TColumns[TKey]> extends Array<any>
    ? never
    : ColumnModel<TColumns[TKey]>;
}>;

export type EntityInstance<TColumns extends AnyColumns> = {
  get id(): number | bigint;
} & {
  [TKey in keyof TColumns]: ColumnModel<TColumns[TKey]>;
};

export type Entity<TColumns extends AnyColumns> = {
  Find(params: FindInput<TColumns>): Array<EntityInstance<TColumns>>;
} & (new (
  model_or_id: number | bigint | EntityInput<TColumns>
) => EntityInstance<TColumns>);
