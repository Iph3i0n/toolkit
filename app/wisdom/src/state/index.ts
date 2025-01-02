import { Directory, StateReader } from "@ipheion/fs-db";
import { Block } from "./block";
import { Page } from "./page";
import Path from "node:path";
import { MediaDir } from "./media";
import { Buffer } from "@ipheion/moulding-tin";

export const DataDir = Path.resolve(process.env.DATA_DIR ?? "./data");

export const Schema = {
  pages: Page,
  blocks: Block,
  media: MediaDir,
  files: new Buffer(),
};

export const Database = new Directory(Schema, DataDir);

export type State = StateReader<typeof Schema>;
