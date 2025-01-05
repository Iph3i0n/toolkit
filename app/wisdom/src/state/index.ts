import { Directory, StateReader } from "@ipheion/fs-db";
import { Block } from "./block";
import { Page } from "./page";
import Path from "node:path";
import { File, MediaDir } from "./media";
import { UTF8 } from "@ipheion/moulding-tin";

export const DataDir = Path.resolve(process.env.DATA_DIR ?? "./data");

export const Schema = {
  pages: Page,
  blocks: Block,
  media: MediaDir,
  files: File,
  properties: new UTF8(),
};

export const Database = new Directory(Schema, DataDir);

export type State = StateReader<typeof Schema>;
