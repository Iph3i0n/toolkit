import { Stage, Layer, Rect, Text, Circle, Line } from "react-konva";
import { MainFont, Theme } from "./theme";

type ConstructProps = {
  name: string;
  args: Array<string>;
  x: number;
  y: number;
};

export default function (props: ConstructProps) {
  const title_width = props.name.length + 1;
  const text_width = title_width + props.args.reduce((c, n) => c + n.length + 1, 0);
  const font_width = MainFont.Size * 0.65;
  return (
    <Layer x={props.x} y={props.y}>
      <Rect
        x={0}
        y={0}
        width={text_width * font_width}
        height={MainFont.Size + 8}
        stroke={Theme.Primary}
        cornerRadius={10}
      />
      <Text
        x={6}
        y={4}
        text={props.name}
        fontFamily={MainFont.Family}
        fontSize={MainFont.Size}
      />

      {props.args.reduce((c, n), [])}
    </Layer>
  );
}
