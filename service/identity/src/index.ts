import Server from "./service/server";
import { ServeDirectory, ServeFile } from "@ipheion/puristee";
import Path from "path";

import "./service/controllers/identity";
import "./service/controllers/login";
import "./service/controllers/password";
import "./service/controllers/register";

Server.CreateHandler("/uitext/**", "get").Register(
  ServeDirectory(Path.join(__dirname, "../uitext"))
);

Server.CreateHandler("/js/**", "get").Register(
  ServeDirectory(Path.join(__dirname, "native"))
);

if (process.env.NODE_ENV !== "production") {
  Server.CreateHandler("/", "get").Register(ServeFile("./test.html"));
  Server.CreateHandler("/bakery/**", "get").Register(
    ServeDirectory(Path.join(__dirname, "../../../lib/bakery/dist"))
  );
}

Server.Listen(3000);
