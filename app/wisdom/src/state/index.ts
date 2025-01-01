import { Directory, StateReader } from "@ipheion/fs-db";
import { Block } from "./block";
import { Page } from "./page";
import Path from "node:path";

export const DataDir = Path.resolve(process.env.DATA_DIR ?? "./data");

export const Schema = {
  pages: Page,
  blocks: Block,
};

export const Database = new Directory(Schema, DataDir);

export type State = StateReader<typeof Schema>;
