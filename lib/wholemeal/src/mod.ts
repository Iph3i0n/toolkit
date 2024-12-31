export {
  LoadedEvent,
  RenderEvent,
  ShouldRender,
  PropsEvent,
  BeforeRenderEvent,
  OnElementLoaded,
} from "./runner/events";

export { ComponentBase } from "./runner/component";
export {
  default as CreateComponent,
  ComponentWrapper,
} from "./runner/component-wrapper";

export function CreateRef<T extends HTMLElement>(): { current?: T } {
  return { current: undefined };
}

export { default as RenderSheet } from "./runner/css";
