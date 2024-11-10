import * as Kefir from "kefir";

import d3 from "d3";

export type Event = any;

export type Value = any;

export type AllEvents = KefirStream;
export type EventMap = { [event: string]: KefirStream };

export type PatchDefinition = {
  handle?: { [event: string]: (event: Event) => void };
};

export type NodeDefinition = {
  title?: string;
  inlets?: { [alias: string]: InletDefinition };
  outlets?: { [alias: string]: OutletDefinition };
  prepare?: (
    inlets: { [alias: string]: Inlet },
    outlets: { [alias: string]: Outlet }
  ) => void;
  process?: (
    inlets_values: { [alias: string]: Value },
    prev_inlets_values?: { [alias: string]: Value }
  ) => void | { [alias: string]: Value | KefirStream };
  tune?: (updates_stream: KefirStream) => KefirStream;
  handle?: { [event: string]: (event: Event) => void };
};

export type NodeRendererDefinition = {
  size?: { width: number; height: number };
  first?: (
    body: HTMLElement,
    configIn?: KefirStream
  ) => void | {
    [inlet_alias: string]: {
      default?: any;
      valueOut?: KefirStream;
    };
  };
  always?: (
    body: HTMLElement,
    inlets_values: { [alias: string]: Value },
    outlets_values: { [alias: string]: Value }
  ) => void;
};

export type InletDefinition = {
  type?: string;
  label?: string;
  default?: Value | KefirStream;
  hidden?: boolean;
  cold?: boolean;
  readonly?: boolean;
  allow?: Array<string>;
  accept?: (value: Value) => boolean;
  adapt?: (value: Value) => Value;
  show?: (value: Value) => string;
  tune?: (updates_stream: KefirStream) => KefirStream;
  handle?: { [event: string]: (event: Event) => void };
};

export type OutletDefinition = {
  type?: string;
  label?: string;
  show?: (value: Value) => string;
  tune?: (updates_stream: KefirStream) => KefirStream;
  handle?: { [event: string]: (event: Event) => void };
};

export type ChannelDefiniton = InletDefinition | OutletDefinition;

export type InletRendererDefinition = {
  show?: (target: HTMLElement, value: Value, repr: string) => void;
  edit?: (
    target: HTMLElement,
    inlet: Inlet,
    valueIn: KefirStream
  ) => KefirStream;
};

export type OutletRendererDefinition = {
  show?: (target: HTMLElement, value: Value, repr: string) => void;
};

declare class Patch {
  Patch(name: string, def?: PatchDefinition): Patch;
  render(
    alias: string | Array<string>,
    targets: string | Array<string> | HTMLElement | Array<HTMLElement>,
    config?: RendererConfig
  ): Patch;
  addNode(
    type: string,
    title?: string,
    def?: NodeDefinition | (() => NodeDefinition)
  ): Node;
  removeNode(node: Node): Patch;
  open(parent: Patch): Patch;
  close(): Patch;
  inputs(list: Array<Inlet>): Patch;
  outputs(list: Array<Outlet>): Patch;
  project(node: Node): Patch;
  moveCanvas(x: number, y: number): Patch;
  resizeCanvas(width: number, height: number): Patch;
  event: EventMap;
  events: AllEvents;
}

declare class Node {
  Node(
    type: string,
    patch: Patch,
    def?: NodeDefinition,
    render?: NodeRendererDefinition | (() => NodeRendererDefinition),
    callback?: (node: Node) => void
  ): Node;
  turnOn(): Node;
  turnOff(): Node;
  addInlet(
    type: string,
    alias: string,
    def?: InletDefinition | (() => InletDefinition)
  ): Inlet;
  addOutlet(
    type: string,
    alias: string,
    def?: OutletDefinition | (() => OutletDefinition)
  ): Outlet;
  removeInlet(inlet: Inlet): Node;
  removeOutlet(outlet: Outlet): Node;
  move(x: number, y: number): Node;
  configure(props: any): Node;
  event: EventMap;
  events: AllEvents;

  inlets: Record<string, Inlet>;
  outlets: Record<string, Outlet>;
}

declare class Inlet {
  Inlet(
    type: string,
    node: Node,
    alias?: string,
    def?: InletDefinition | (() => InletDefinition),
    render?: InletRendererDefinition | (() => InletRendererDefinition)
  ): Inlet;
  receive(value: any): Inlet; // FIXME: value: any except KefirStream
  stream(stream: KefirStream): Inlet;
  toDefault(): Inlet;
  allows(outlet: Outlet): boolean;
  event: EventMap;
  events: AllEvents;
}

declare class Outlet {
  Outlet(
    type: string,
    node: Node,
    alias?: string,
    def?: OutletDefinition | (() => OutletDefinition),
    render?: OutletRendererDefinition | (() => OutletRendererDefinition)
  ): Outlet;
  connect(inlet: Inlet): Link;
  disconnect(link: Link): Outlet;
  send(value: any): Outlet; // FIXME: value: any except KefirStream
  stream(stream: KefirStream): Outlet;
  toDefault(): Outlet;
  event: EventMap;
  events: AllEvents;
}

declare class Link {
  Link(outlet: Outlet, inlet: Inlet, label?: string): Link;
  pass(value: any): Link;
  enable(): Link;
  disable(): Link;
  disconnect(): Link;
  event: EventMap;
  events: AllEvents;
}

export type ChannelRendererDefinition =
  | InletRendererDefinition
  | OutletRendererDefinition;

export type RendererConfig = any; /* TODO */

export type KefirStream = Kefir.Observable<any, any>;

export type RendererDefinition = (Patch) => (
  networkRoot: HTMLElement,
  config: RendererConfig
) => {
  [event: string]: Value;
};

export type StyleDefinitionObject = {
  edgePadding?: { horizontal: number; vertical: number };
  boxPadding?: { horizontal: number; vertical: number };
  createCanvas: (patch: Patch, parent: HTMLElement) => { element: HTMLElement };
  createNode: (
    node: Node,
    render: NodeRendererDefinition,
    description: string,
    icon: string
  ) => {
    element: HTMLElement;
    size?: { width: number; height: number };
  };
  createInlet: (
    inlet: Inlet,
    render: InletRendererDefinition
  ) => { element: HTMLElement };
  createOutlet: (
    outlet: Inlet,
    render: OutletRendererDefinition
  ) => { element: HTMLElement };
  createLink: (link: Link) => { element: HTMLElement /* TODO */ };
  getInletPos: (inlet: Inlet) => { x: number; y: number };
  getOutletPos: (outlet: Outlet) => { x: number; y: number };
  getLocalPos: (pos: { x: number; y: number }) => { x: number; y: number };
  onPatchSwitch?: (patch: Patch, canvas: HTMLElement) => void;
  onNodeRemove?: (node: Node) => void;
};

export type StyleDefinition = (config: any) => StyleDefinitionObject;

export type IOModule = any; /* TODO */

export type NavigationModule = any; /* TODO */

export type Stringify = {
  patch: (Patch) => String;
  node: (Node) => String;
  inlet: (Inlet) => String;
  outlet: (Outlet) => String;
  link: (Link) => String;
};

export type AutoStringify = (
  input: Patch | Node | Inlet | Outlet | Link
) => String;

declare var HiddenTypes: {
  Patch: typeof Patch;
  Node: typeof Node;
  Inlet: typeof Inlet;
  Outlet: typeof Outlet;
  Link: typeof Link;
};

declare var Rpd: {
  VERSION: string;

  d3: typeof d3;
  //Rpd: typeof Rpd;

  _: typeof HiddenTypes;

  Patch: typeof Patch;
  Node: typeof Node;
  Inlet: typeof Inlet;
  Outlet: typeof Outlet;
  Link: typeof Link;

  event: EventMap;
  events: AllEvents;

  // registration
  nodetype(type: string, def: NodeDefinition | (() => NodeDefinition)): void;
  channeltype(
    type: string,
    def: ChannelDefiniton | (() => ChannelDefiniton)
  ): void;
  renderer(alias: string, def: RendererDefinition): void;
  noderenderer(
    type: string,
    alias: string,
    def: NodeRendererDefinition | (() => NodeRendererDefinition)
  ): void;
  channelrenderer(
    type: string,
    alias: string,
    def: ChannelRendererDefinition | (() => ChannelRendererDefinition)
  ): void;
  nodedescription(type: string, description: string): void;
  style(alias: string, renderer: string, def: StyleDefinition): void;
  toolkiticon(toolkit: string, icon: string): void;
  nodetypeicon(type: string, icon: string): void;

  addPatch(name?: string, def?: PatchDefinition, parent?: Patch): Patch;
  addClosedPatch(name?: string, def?: PatchDefinition): Patch;
  renderNext(
    alias: string | Array<string>,
    target: Array<string> | string | HTMLElement | Array<HTMLElement>,
    config?: RendererConfig
  ): void;
  stopRendering(): void;

  stringify: Stringify;
  autoStringify: AutoStringify;
};

export default Rpd;
