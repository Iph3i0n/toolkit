import { Layer, Line } from "react-konva";
import { UseInstance, UseTrace } from "./state";
import { Border } from "./theme";
import { ConstructHeight, NodeSize } from "./construct";

export default function Trace(props: { instance_id: string }) {
  const trace = UseTrace(props.instance_id);
  const from = UseInstance(trace.from[0]);
  const to = UseInstance(trace.to[0]);

  return (
    <Layer>
      <Line
        points={[
          from.instance.x + NodeSize * (trace.from[1] + 2),
          from.instance.y + ConstructHeight + NodeSize,
          ...trace.anchors.flatMap((a) => a),
          to.instance.x + NodeSize * (trace.to[1] + 1),
          to.instance.y - NodeSize,
        ]}
        {...Border.Highlight}
        lineCap="round"
        lineJoin="round"
      />
    </Layer>
  );
}
