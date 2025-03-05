import {
  Assert,
  IsArray,
  IsNumber,
  IsObject,
  IsString,
  Optional,
} from "@ipheion/safe-type";
import Databaseable from "./databaseable";

const IsCategoryModel = IsObject({
  id: IsNumber,
  name: IsString,
  parent: Optional(IsNumber),
});

export default class Category extends Databaseable {
  readonly #id: number;
  #name: string;
  #parent?: number;

  constructor(id: number);
  constructor(name: string, parent?: Category);
  constructor(...args: [id: number] | [name: string, parent?: Category]) {
    super();

    if (typeof args[0] === "number") {
      const [id] = args;
      const match = this.get`SELECT * FROM categories WHERE id = ${id} LIMIT 1`;
      Assert(IsCategoryModel, match);
      this.#id = match.id;
      this.#name = match.name;
      this.#parent = match.parent ?? undefined;
    } else {
      const [name, parent] = args;
      const row_id = this.exec`
        INSERT INTO categories (name, parent)
        VALUES (${name}, ${parent?.Id ?? null})
      `;

      Assert(IsNumber, row_id);
      this.#id = row_id;
      this.#name = name;
      this.#parent = parent?.Id;
    }
  }

  get Id() {
    return this.#id;
  }

  get Name() {
    return this.#name;
  }

  set Name(value: string) {
    this.exec`
      UPDATE categories
      SET name = ${value}
      WHERE id = ${this.#id}
    `;

    this.#name = value;
  }

  get Parent(): Category | undefined {
    if (!this.#parent) {
      return undefined;
    }

    return new Category(this.#parent);
  }

  set Parent(value: Category | undefined) {
    this.exec`
      UPDATE categories
      SET parent = ${value?.Id ?? null}
      WHERE id = ${this.#id}
    `;

    this.#parent = value?.Id;
  }
  static Children(entity?: Category) {
    const rows = entity
      ? this.query`
        SELECT id
        FROM categories
        WHERE parent = ${entity?.Id ?? null}
      `
      : this.query`
        SELECT id FROM categories WHERE parent IS NULL
      `;

    Assert(IsArray(IsObject({ id: IsNumber })), rows);

    return rows.map((r) => new Category(r.id));
  }
}
