import {
  Assert,
  IsNumber,
  IsObject,
  IsString,
  Optional,
} from "@ipheion/safe-type";
import Databaseable from "./databaseable";

const IsTagModel = IsObject({
  id: IsNumber,
  name: IsString,
  parent: Optional(IsNumber),
});

export default class Tag extends Databaseable {
  readonly #id: number;
  #name: string;
  #parent?: number;

  constructor(id: number);
  constructor(name: string, parent?: Tag);
  constructor(...args: [id: number] | [name: string, parent?: Tag]) {
    super();

    if (typeof args[0] === "number") {
      const [id] = args;
      const match = this.get`SELECT * FROM tags WHERE id = ${id} LIMIT 1`;
      Assert(IsTagModel, match);
      this.#id = match.id;
      this.#name = match.name;
      this.#parent = match.parent ?? undefined;
    } else {
      const [name, parent] = args;
      const row_id = this.exec`
        INSERT INTO tags (name, parent)
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
      UPDATE tags
      SET name = ${value}
      WHERE id = ${this.#id}
    `;

    this.#name = value;
  }

  get Parent(): Tag | undefined {
    if (!this.#parent) {
      return undefined;
    }

    return new Tag(this.#parent);
  }

  set Parent(value: Tag | undefined) {
    this.exec`
      UPDATE tags
      SET parent = ${value?.Id ?? null}
      WHERE id = ${this.#id}
    `;

    this.#parent = value?.Id;
  }
}
