import Component from "@ipheion/wholemeal/dist/xml/component";
import ISchemaRepository from "integrations/i-schema-repository";

export default class SchemaService {
  readonly #schema_repository: ISchemaRepository;

  constructor(schema_repository: ISchemaRepository) {
    this.#schema_repository = schema_repository;
  }

  #parse(data: Component) {
    return {
      properties: data.Metadata.Attr.map((a) => ({
        label: a.Description.Text,
        name: a.Name,
        type: a.Type,
        options: a.Options?.split(",") ?? [],
      })),
      slots: data.Metadata.Slots.map((s) => ({ name: s.Name })),
    };
  }

  async get_layout(name: string) {
    const data = await this.#schema_repository.get_layout(name);
    return this.#parse(data);
  }

  async get_block(name: string) {
    const data = await this.#schema_repository.get_block(name);
    return this.#parse(data);
  }
}
