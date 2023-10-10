const Writer = Symbol();

export default abstract class BaseWriter {
  get Symbol() {
    return Writer;
  }

  abstract toString(): string;
}

export const reserved = ["'", '"', "-", "`", "{", "}"];

export const has_reserved = (data: string) =>
  !!reserved.find((r) => data.includes(r));
