import React from "react";
import { createRoot } from "react-dom/client";
import { Stage } from "react-konva";
import Construct from "ui/construct";
import { AppState, AppStateProvider } from "ui/state";
import Trace from "ui/trace";

const App = () => {
  const [state, set_state] = React.useState<AppState>({
    constructs: {
      "yello-world": {
        args: [
          { type_name: "string", description: "This is the test arg" },
          { type_name: "string", description: "This is the second arg" },
        ],
        outlets: [
          { type_name: "number", description: "This is an outlet" },
          { type_name: "string", description: "This is another outlet" },
        ],
        inlets: [
          { type_name: "number", description: "This is an inlet" },
          { type_name: "string", description: "This is another inlet" },
        ],
      },
    },
    traces: {
      created: {
        from: ["testinstancea", 2],
        to: ["testinstanceb", 1],
        anchors: [[40, 500]],
      },
    },
    instances: {
      testinstancea: {
        x: 20,
        y: 95,
        type: "yello-world",
        args: ["test", "arg"],
      },
      testinstanceb: {
        x: 250,
        y: 180,
        type: "yello-world",
        args: ["hello", "world"],
      },
    },
  });

  return (
    <AppStateProvider state={state} on_change={set_state}>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        {Object.keys(state.instances).map((id) => (
          <Construct key={id} instance_id={id} />
        ))}
        {Object.keys(state.traces).map((id) => (
          <Trace key={id} instance_id={id} />
        ))}
      </Stage>
    </AppStateProvider>
  );
};

const container = document.getElementById("target");
if (!container) throw new Error("Could not resolve container");
const root = createRoot(container);
root.render(<App />);
