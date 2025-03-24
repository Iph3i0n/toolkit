import type Node from "node";

type NodeConstructor = new (ele: Element) => Node;

const nodes: Record<string, NodeConstructor> = {};

export function valid_element(name: string) {
  return <TNode extends NodeConstructor>(target: TNode) => {
    nodes[name] = target;
  };
}

export function get_node(ele: Element) {
  const item = nodes[ele.tagName.toLowerCase()];
  if (!item) return undefined;
  return new item(ele);
}
