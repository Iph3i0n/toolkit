import CreateServer from "@ipheion/puristee";
import { User } from "./models/user";

const Server = CreateServer("./data", {
  users: User,
});

Server.CreateHandler("/api/v1/user/profile", "GET").Register(
  (req, state) => {}
);
