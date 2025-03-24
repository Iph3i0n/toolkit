import { Component } from "@ipheion/wholemeal/dist/compiler";

export default interface ISchemaRepository {
  is_block(name: string): Promise<boolean>;

  get_layouts(): Promise<Array<string>>;
  get_blocks(): Promise<Array<string>>;
  get_components(): Promise<Array<string>>;
  get_layout(name: string): Promise<Component>;
  get_block(name: string): Promise<Component>;
  get_component(name: string): Promise<Component>;
}
