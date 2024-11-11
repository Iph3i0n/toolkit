import Path from "node:path";
import CreateServer from "@ipheion/puristee";
import { StateReader } from "@ipheion/fs-db";
import Axios from "axios";

const InitalState = {};

export const DataDir = process.env.DATA_DIR ?? "./data";

export type State = StateReader<typeof InitalState>;

const Server = CreateServer(Path.resolve(DataDir), InitalState, {});

export abstract class Handler extends Server.Handler {
  async Page(name: string) {
    const result = await Axios.get("http://localhost:1337/" + name);
    return result.data;
  }

  async List(area: string) {
    const result = await Axios.get("http://localhost:1337/" + area);
    return result.data;
  }

  async Entry(area: string, name: string) {
    const result = await Axios.get(`http://localhost:1337/${area}/${name}`);
    return result.data;
  }
}

export const Result = Server.Response;

export type Result = typeof Server.Response;
