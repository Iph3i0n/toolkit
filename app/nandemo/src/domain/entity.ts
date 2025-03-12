import { Assert, IsArray, IsObject, IsNumber } from "@ipheion/safe-type";
import Category from "./category";
import Databaseable from "./databaseable";
import Tag from "./tag";
import { EntityModel } from "models/entity";
import Image from "./image";

type SearchProps = {
  category?: Category;
  tags: Array<Tag>;
  require_all_tags?: boolean;
  term?: string;
};

export default class Entity extends Databaseable {
  readonly #id: number;
  #name: string;
  #quantity: number;
  #url?: string;
  #img_id?: number;
  #container?: number;
  #category?: number;
  #tags: Array<number>;
  #comment?: string;

  constructor(id: number);
  constructor(
    name: string,
    quantity: number,
    url?: string,
    img?: Image,
    container?: Entity,
    category?: Category,
    tags?: Array<Tag>,
    comment?: string
  );
  constructor(
    ...args:
      | [id: number]
      | [
          name: string,
          quantity: number,
          url?: string,
          img?: Image,
          container?: Entity,
          category?: Category,
          tags?: Array<Tag>,
          comment?: string
        ]
  ) {
    super();

    if (typeof args[0] === "number") {
      const [id] = args;
      const match = this.get`SELECT * FROM entities WHERE id = ${id} LIMIT 1`;
      Assert(EntityModel, match);
      const tags = this.query`SELECT tag FROM entity_tags WHERE entity = ${id}`;
      Assert(IsArray(IsObject({ tag: IsNumber })), tags);

      this.#id = match.id;
      this.#name = match.name;
      this.#quantity = match.quantity;
      this.#url = match.url ?? undefined;
      this.#img_id = match.img_id ?? undefined;
      this.#container = match.container ?? undefined;
      this.#category = match.category ?? undefined;
      this.#tags = tags.map((t) => t.tag);
      this.#comment = match.comment ?? undefined;
    } else {
      const [name, quantity, url, img, container, category, tags, comment] =
        args;
      const row_id = this.exec`
        INSERT INTO entities (
          name,
          quantity,
          url,
          img_id,
          container,
          category,
          comment
        ) VALUES (
         ${name},
         ${quantity ?? null},
         ${url ?? null},
         ${img?.Id ?? null},
         ${container?.Id ?? null},
         ${category?.Id ?? null},
         ${comment ?? null} 
        )
      `;
      Assert(IsNumber, row_id);

      for (const tag of tags ?? [])
        this.exec`
          INSERT INTO entity_tags (
            entity,
            tag
          ) VALUES (
            ${row_id},
            ${tag.Id}
          )
        `;

      this.#id = row_id;
      this.#name = name;
      this.#quantity = quantity ?? 1;
      this.#url = url;
      this.#img_id = img?.Id;
      this.#container = container?.Id;
      this.#category = category?.Id;
      this.#tags = tags?.map((t) => t.Id) ?? [];
      this.#comment = comment;
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
      UPDATE entities
      SET name = ${value}
      WHERE id = ${this.#id}
    `;
    this.#name = value;
  }

  get Quantity() {
    return this.#quantity;
  }

  set Quantity(value: number) {
    this.exec`
      UPDATE entities
      SET quantity = ${value}
      WHERE id = ${this.#id}
    `;
    this.#quantity = value;
  }

  get Url() {
    return this.#url;
  }

  set Url(value: string | undefined) {
    this.exec`
      UPDATE entities
      SET url = ${value ?? null}
      WHERE id = ${this.#id}
    `;
    this.#url = value;
  }

  get Img() {
    return this.#img_id ? new Image(this.#img_id) : undefined;
  }

  set Img(value: Image | undefined) {
    this.exec`
      UPDATE entities
      SET img_id = ${value?.Id ?? null}
      WHERE id = ${this.#id}
    `;

    this.#img_id = value?.Id;
  }

  get Container() {
    if (!this.#container) return undefined;
    return new Entity(this.#container);
  }

  set Container(value: Entity | undefined) {
    this.exec`
      UPDATE entities
      SET container = ${value?.Id ?? null}
      WHERE id = ${this.#id}
    `;
    this.#container = value?.Id;
  }

  get Category() {
    if (!this.#category) return undefined;
    return new Category(this.#category);
  }

  set Category(value: Category | undefined) {
    this.exec`
      UPDATE entities
      SET category = ${value?.Id ?? null}
      WHERE id = ${this.#id}
    `;
    this.#category = value?.Id;
  }

  get Comment() {
    return this.#comment;
  }

  set Comment(value: string | undefined) {
    this.exec`
      UPDATE entities
      SET comment = ${value ?? null}
      WHERE id = ${this.#id}
    `;
    this.#comment = value;
  }

  get Tags() {
    return this.#tags.map((t) => new Tag(t));
  }

  set Tags(value: Array<Tag>) {
    this.exec`
      DELETE FROM entity_tags
      WHERE entity = ${this.#id}
    `;

    for (const tag of value)
      this.exec`INSERT INTO entity_tags (entity, tag) VALUES (${this.#id}, ${
        tag.Id
      })`;

    this.#tags = value.map((t) => t.Id);
  }

  static Children(entity?: Entity) {
    const rows = entity
      ? this.query`
        SELECT id
        FROM entities
        WHERE container = ${entity?.Id ?? null}
      `
      : this.query`
        SELECT id FROM entities WHERE container IS NULL
      `;

    Assert(IsArray(IsObject({ id: IsNumber })), rows);

    return rows.map((r) => new Entity(r.id));
  }

  static Search(props: SearchProps) {
    const query = [
      props.term ? "e.name LIKE ?" : "",
      props.category ? "e.category = ?" : "",
      props.tags
        .map(() => "t.tag = ?")
        .join(props.require_all_tags ? " AND " : " OR "),
    ]
      .filter((r) => r)
      .join(" AND ");

    const parameters = [
      props.term ? `%${props.term}%` : undefined,
      props.category?.Id,
      ...props.tags.map((t) => t.Id),
    ].filter((r) => typeof r !== "undefined");

    const rows = this.query(
      [
        `
        SELECT DISTINCT e.id
        FROM entities e
        RIGHT JOIN entity_tags t ON e.id = t.entity
        WHERE ${query}
      `,
      ],
      ...parameters
    );

    Assert(IsArray(IsObject({ id: IsNumber })), rows);
    return rows.map((r) => new Entity(r.id));
  }

  static Delete(entity: Entity) {
    this.exec`
      DELETE
      FROM entity_tags
      WHERE entity = ${entity.Id}
    `;
    this.exec`
      DELETE
      FROM entities
      WHERE id = ${entity.Id}
    `;
  }
}
