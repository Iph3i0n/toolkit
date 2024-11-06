import path from "path";

export function Media(...parts: Array<string>) {
  return path.resolve(__dirname, "../../media", ...parts);
}
