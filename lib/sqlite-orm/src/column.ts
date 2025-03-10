import { SupportedValueType } from "node:sqlite";
import type { Table } from "./table";
import type { EntityInstance } from "./entity";

const PrimaryKeyType = "INTEGER";

export class Column<TInput, TStore extends SupportedValueType> {
  readonly #name: string;
  readonly #serialise: (item: TInput) => TStore;
  readonly #deserialise: (item: TStore) => TInput;
  readonly #nullable: boolean;
  readonly #constraints: string;

  private constructor(
    name: string,
    serialise: (item: TInput) => TStore,
    deserialise: (item: TStore) => TInput,
    nullable = false,
    constraints = ""
  ) {
    this.#name = name;
    this.#serialise = serialise;
    this.#deserialise = deserialise;
    this.#nullable = nullable;
    this.#constraints = constraints;
  }

  get IsEmpty() {
    return !!this.#name;
  }

  get Declaration() {
    return [this.#name, this.#nullable ? "NOT NULL" : "", this.#constraints]
      .filter((r) => r)
      .join(" ");
  }

  Optional() {
    return new Column(
      this.#name,
      (i: TInput | null) => (i == null ? null : this.#serialise(i)),
      (i: TStore | null) => (i == null ? null : this.#deserialise(i)),
      true,
      this.#constraints
    );
  }

  static get PrimaryKey() {
    return new Column(
      PrimaryKeyType,
      (i: number) => i,
      (i) => i,
      true,
      "PRIMARY KEY"
    );
  }

  static get Int() {
    return new Column(
      "INTEGER",
      (i: number) => i,
      (i) => i
    );
  }

  static get TinyInt() {
    return new Column(
      "TINYINT",
      (i: number) => i,
      (i) => i
    );
  }

  static get SmallInt() {
    return new Column(
      "SMALLINT",
      (i: number) => i,
      (i) => i
    );
  }

  static get MediumInt() {
    return new Column(
      "MEDIUMINT",
      (i: number) => i,
      (i) => i
    );
  }

  static get BigInt() {
    return new Column(
      "BIGINT",
      (i: number) => i,
      (i) => i
    );
  }

  static get UnsignedBigInt() {
    return new Column(
      "UNSIGNED BIG INT",
      (i: number) => i,
      (i) => i
    );
  }

  static get Int2() {
    return new Column(
      "INT2",
      (i: number) => i,
      (i) => i
    );
  }

  static get Int8() {
    return new Column(
      "INT8",
      (i: number) => i,
      (i) => i
    );
  }

  static get Real() {
    return new Column(
      "REAL",
      (i: number) => i,
      (i) => i
    );
  }

  static get Double() {
    return new Column(
      "DOUBLE",
      (i: number) => i,
      (i) => i
    );
  }

  static get DoublePrecision() {
    return new Column(
      "DOUBLE PRECISION",
      (i: number) => i,
      (i) => i
    );
  }

  static get Float() {
    return new Column(
      "FLOAT",
      (i: number) => i,
      (i) => i
    );
  }

  static get Numeric() {
    return new Column(
      "NUMERIC",
      (i: number) => i,
      (i) => i
    );
  }

  static get BOOLEAN() {
    return new Column(
      "NUMERIC",
      (i: boolean) => (i ? 1 : 0),
      (i) => (i === 1 ? true : false)
    );
  }

  static get Date() {
    return new Column(
      "DATE",
      (i: Date) => i.toISOString().split("T")[0],
      (i) => new Date(i)
    );
  }

  static get DateTime() {
    return new Column(
      "DATETIME",
      (i: Date) => i.toISOString(),
      (i) => new Date(i)
    );
  }

  static get Buffer() {
    return new Column(
      "BLOB",
      (i: Buffer) => new Uint8Array(i),
      (i) => Buffer.from(i)
    );
  }

  static get Text() {
    return new Column(
      "TEXT",
      (i: string) => i,
      (i) => i
    );
  }

  static get Clob() {
    return new Column(
      "CLOB",
      (i: string) => i,
      (i) => i
    );
  }

  static Character(digits: number) {
    return new Column(
      `CHARACTER(${digits})`,
      (i: string) => i,
      (i) => i
    );
  }

  static VarChar(digits: number) {
    return new Column(
      `VARCHAR(${digits})`,
      (i: string) => i,
      (i) => i
    );
  }

  static VaryingCharacter(digits: number) {
    return new Column(
      `VARYING CHARACTER(${digits})`,
      (i: string) => i,
      (i) => i
    );
  }

  static NCHAR(digits: number) {
    return new Column(
      `NCHAR(${digits})`,
      (i: string) => i,
      (i) => i
    );
  }

  static NativeCharacter(digits: number) {
    return new Column(
      `NATIVE CHARACTER(${digits})`,
      (i: string) => i,
      (i) => i
    );
  }

  static NvarChar(digits: number) {
    return new Column(
      `NVARCHAR(${digits})`,
      (i: string) => i,
      (i) => i
    );
  }

  static Reference<TColumns extends AnyColumns>(table: Table<TColumns>) {
    return new Column(
      PrimaryKeyType,
      (i: EntityInstance<TColumns>) => i.id,
      (i) => new table.Entity(i),
      false,
      `REFERENCES ${table.Reference}`
    );
  }
}

export type ColumnModel<T> = T extends Column<infer R, SupportedValueType>
  ? R
  : never;

export type AnyColumns = Record<string, Column<any, SupportedValueType>>;
