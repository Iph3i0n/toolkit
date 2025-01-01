import Component from "@ipheion/wholemeal/dist/xml/component";

export default interface ISchemaRepository {
  get_layouts(): Promise<Array<string>>;
  get_blocks(): Promise<Array<string>>;
  get_components(): Promise<Array<string>>;
  get_layout(name: string): Promise<Component>;
  get_block(name: string): Promise<Component>;
  get_component(name: string): Promise<Component>;
}
