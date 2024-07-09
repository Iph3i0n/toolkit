import { Directory } from "@ipheion/fs-db";
import { StartServer } from "@ipheion/puristee";
import { DataDir, Schema } from "local/server";
import Path from "node:path";
import { v4 as Guid } from "uuid";

const dir = new Directory(Schema, Path.resolve(DataDir, "local"));

let populated = false;
for (const _ of dir.Model.roles) {
  populated = true;
  break;
}

if (!populated) {
  console.log(`New Server! Creating an admin role, password will be admin`);

  dir.Write({
    roles: {
      [Guid()]: {
        version: 1,
        name: "admin",
        admin: true,
        password: "admin",
        policies: [],
      },
    },
  });
}

StartServer({
  handler_dir: Path.resolve(__dirname, "local/handlers"),
  port: 3002,
  threads: parseInt(process.env.THREADS ?? "6"),
});
