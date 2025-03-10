import { AnyColumns, Column } from "./column";
import { Entity } from "./entity";

export class Table<TColumns extends AnyColumns> {
  readonly #name: string;
  readonly #columns: TColumns;

  constructor(name: string, columns: TColumns) {
    this.#name = name;
    this.#columns = columns;
  }

  get Name() {
    return this.#name;
  }

  get Declaration() {
    return `
      CREATE TABLE IF NOT EXISTS ${this.#name} (
        id ${Column.PrimaryKey.Declaration},
        ${Object.keys(this.#columns)
          .filter((c) => !this.#columns[c].IsEmpty)
          .map((c) => [c, this.#columns[c].Declaration])
          .join(",\n")}
      );
    `;
  }

  get Reference() {
    return `${this.#name}(id)`;
  }

  get Entity(): Entity<TColumns> {
    return {} as any;
  }
}

export class ManyToManyTable<
  TColumns1 extends AnyColumns,
  TColumns2 extends AnyColumns
> {
  readonly #table_1: Table<TColumns1>;
  readonly #table_2: Table<TColumns2>;

  constructor(table_1: Table<TColumns1>, table_2: Table<TColumns2>) {
    this.#table_1 = table_1;
    this.#table_2 = table_2;
  }

  get Declaration() {
    return `
      CREATE TABLE IF NOT EXISTS ${this.#table_1.Name}_${this.#table_2.Name} (
        id ${Column.PrimaryKey.Declaration},
        ${this.#table_1.Name}_id ${Column.Reference(this.#table_1).Declaration},
        ${this.#table_2.Name}_id ${Column.Reference(this.#table_2).Declaration}
      )
    `;
  }
}
