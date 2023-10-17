import { ASCII, Array, DateTime, Struct, UTF8 } from "@ipheion/moulding-tin";
import CreateServer from "@ipheion/puristee/dist/server";

const DATA_DIR = process.env.DATA_DIR ?? "./data";

const Model = {
  users: new Struct({
    email: new UTF8(),
    name: new UTF8(),
    password: new ASCII(),
    last_login: new DateTime(),
    roles: new Array(new ASCII()),
  }),
};

export default CreateServer(DATA_DIR, Model);
