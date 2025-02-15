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
import { database } from "domain/databaseable";
import Express from "express";
import PageHandler from "handlers/page";
import { auth } from "express-openid-connect";

database.exec(`
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    script TEXT NOT NULL
  )
`);

const ran = database.prepare("SELECT * FROM migrations").all();

Assert(IsArray(IsObject({ id: IsNumber, script: IsString })), ran);

for (const migration of Fs.readdirSync("./migrations")) {
  if (ran.find((r) => r.script === migration)) continue;
  database.exec("BEGIN TRANSACTION");

  try {
    const content = Fs.readFileSync(
      Path.resolve("./migrations", migration),
      "utf8"
    );

    for (const statement of content.split(";"))
      if (statement.trim()) database.exec(statement.trim());

    database.exec(`INSERT INTO migrations (script)  VALUES ('${migration}')`);

    database.exec("COMMIT");
  } catch (err) {
    database.exec("ROLLBACK");
    throw err;
  }
}
const config = {
  authRequired: true,
  auth0Logout: true,
  secret: process.env.LOGIN_SECRET,
  baseURL: "http://localhost:3000",
  clientID: "WnNj9JeT66ARUSJY7KOL1osRojMmeY0R",
  issuerBaseURL: "https://dev-2d63tvux8yf7n4ux.us.auth0.com",
};

const app = Express();
app.use(auth(config));

app.use(Express.static(Path.resolve(__dirname, "..")));
app.get("*", PageHandler as any);

app.listen(3000, () => console.log("Successfully started app"));
