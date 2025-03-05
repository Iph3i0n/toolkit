import "dotenv/config";
import Fs from "fs";
import Path from "path";
import {
  Assert,
  IsArray,
  IsNumber,
  IsObject,
  IsString,
} from "@ipheion/safe-type";
import Databaseable, { database } from "domain/databaseable";
import Express from "express";
import { auth } from "express-openid-connect";
import Env from "env";

Databaseable.exec`
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    script TEXT NOT NULL
  )
`;

const ran = Databaseable.query`SELECT * FROM migrations`;

Assert(IsArray(IsObject({ id: IsNumber, script: IsString })), ran);

for (const migration of Fs.readdirSync("./migrations")) {
  if (ran.find((r) => r.script === migration)) continue;

  const content = Fs.readFileSync(
    Path.resolve("./migrations", migration),
    "utf8"
  );

  try {
    console.log(`Executing Migration: ${migration}`);
    Databaseable.exec`BEGIN TRANSACTION`;
    for (const statement of content.split(";")) {
      if (statement.trim()) {
        Databaseable.exec([statement.trim()]);
      }
    }

    Databaseable.exec`INSERT INTO migrations (script)  VALUES (${migration})`;
    Databaseable.exec`COMMIT`;
  } catch (err) {
    Databaseable.exec`ROLLBACK`;
    throw err;
  }
}

const app = Express();

app.use(Express.json());

if (Env.Find("OAUTH_BASE_URL"))
  app.use(
    auth({
      authRequired: true,
      auth0Logout: true,
      secret: Env.Get("LOGIN_SECRET"),
      baseURL: Env.Get("OAUTH_BASE_URL"),
      clientID: Env.Get("OAUTH_CLIENT_ID"),
      issuerBaseURL: Env.Get("OAUTH_ISSUER_BASE_URL"),
    })
  );

app.use(Express.static(Path.resolve(__dirname, "..")));

for (const handler of Fs.readdirSync(Path.resolve(__dirname, "handlers"))) {
  require(Path.resolve(__dirname, "handlers", handler)).default(app);
}

app.listen(3000, () => console.log("Successfully started app"));
