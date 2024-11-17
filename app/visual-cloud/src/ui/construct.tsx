import { Circle, Layer, Rect, Text } from "react-konva";
import {
  Border,
  Font,
  FontHeight,
  FontWidth,
  Padding,
  Shadow,
  Theme,
} from "./theme";
import { UseHover } from "./ui-hooks";
import { Argument, UseInstance } from "./state";
import React from "react";

type ConstructProps = {
  instance_id: string;
};

type ArgsAggregate = {
  cursor: number;
  items: Array<JSX.Element>;
};

export const NodeSize = 7;
const font_width = FontWidth("Body");
export const ConstructHeight = FontHeight("Body") + Padding.Body * 2;

function Node(props: { index: number; bottom?: boolean; spec: Argument }) {
  const { hovering, props: hover_props } = UseHover();

  return (
    <Circle
      x={props.index * (NodeSize * 2) + NodeSize * 2}
      y={props.bottom ? ConstructHeight + NodeSize : -NodeSize}
      width={NodeSize}
      height={NodeSize}
      {...Border.Highlight}
      {...(hovering ? Shadow.Body : {})}
      {...hover_props}
    />
  );
}

export default function (props: ConstructProps) {
  const { instance, spec } = UseInstance(props.instance_id);
  const { hovering, props: hover_props } = UseHover();
  const title_width = instance.type.length + 2;
  const text_width =
    title_width + instance.args.reduce((c, n) => c + n.length + 1, 0);

  return (
    <Layer x={instance.x} y={instance.y} {...hover_props}>
      <Rect
        x={0}
        y={0}
        width={text_width * font_width}
        height={ConstructHeight}
        fill={Theme.BackgroundBody}
        {...(hovering ? Shadow.Body : {})}
      />

      <Rect
        x={0}
        y={0}
        width={(title_width - 1) * font_width}
        height={ConstructHeight}
        fill={Theme.BackgroundHighlight}
      />

      <Rect
        x={0}
        y={0}
        width={text_width * font_width}
        height={ConstructHeight}
        {...Border.Body}
      />

      <Text x={6} y={4} text={instance.type} {...Font.Body} />

      {
        instance.args.reduce<ArgsAggregate>(
          (c, n, i) => ({
            cursor: c.cursor + n.length + 1,
            items: [
              ...c.items,
              <Text
                key={i}
                x={c.cursor * font_width}
                y={Padding.Body}
                text={n}
                {...Font.Body}
              />,
            ],
          }),
          { cursor: title_width, items: [] }
        ).items
      }

      {spec.outlets.map((o, i) => (
        <React.Fragment key={i}>
          <Node index={i} spec={o} bottom />
        </React.Fragment>
      ))}

      {spec.inlets.map((o, i) => (
        <React.Fragment key={i}>
          <Node index={i} spec={o} />
        </React.Fragment>
      ))}
    </Layer>
  );
}
