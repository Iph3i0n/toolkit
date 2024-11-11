import { createRoot } from "react-dom/client";
import { Stage, Layer, Rect, Text, Circle, Line } from "react-konva";
import Construct from "ui/construct";

const App = () => {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Construct name="yello-world" args={["test", "arg"]} x={50} y={50} />
    </Stage>
  );
};

const container = document.getElementById("target");
if (!container) throw new Error("Could not resolve container");
const root = createRoot(container);
root.render(<App />);
