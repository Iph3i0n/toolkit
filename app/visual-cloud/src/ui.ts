import Rpd from "@ipheion/rpd";

const target = document.getElementById("target");
if (!target) throw new Error("Could not find target element");

Rpd.renderNext("html", target, { style: "quartz" });

const root = Rpd.addPatch("root").resizeCanvas(800, 400);

const metro1 = root.addNode("util/metro", "Metro A").move(40, 20);
const metro2 = root.addNode("util/metro", "Metro B").move(40, 120);

const genA = root.addNode("util/random", "Generate A").move(300, 10);
const genB = root.addNode("util/random", "Generate B").move(300, 160);

const sum = root.addNode("util/+", "Sum").move(520, 80);

genA.outlets["random"].connect(sum.inlets["a"]);
genB.outlets["random"].connect(sum.inlets["b"]);

metro1.outlets["bang"].connect(genA.inlets["bang"]);
metro2.outlets["bang"].connect(genB.inlets["bang"]);
