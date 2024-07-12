import { Directory } from "@ipheion/fs-db";
import { StartServer } from "@ipheion/puristee";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import type { Role } from "local/models/role";
import { DataDir, Schema } from "local/server";
import Path from "node:path";
import { v4 as Guid } from "uuid";

const dir = new Directory(Schema, Path.resolve(DataDir, "local"));

let populated: [string, Role] | undefined = undefined;
for (const [id, role] of dir.Model.roles) {
  if (role.admin) {
    populated = [id, role];
    break;
  }
}

if (!populated) {
  const id = Guid();
  const role: Role = {
    version: 1,
    name: "admin",
    admin: true,
    policies: [],
  };
  dir.Write({ roles: { [id]: role } });
}

(async () => {
  if (!populated) throw new Error("Could not populate admin user");
  const service = NewAuthService(dir.Model);
  const url = await service.CreateInviteUrl(populated[0]);

  console.log(`Admin Invite URL (valid for 2 hours):\n${url}`);
})().catch((err) => console.error(err));

StartServer({
  handler_dir: Path.resolve(__dirname, "local/handlers"),
  port: 3002,
  threads: parseInt(process.env.THREADS ?? "6"),
});
