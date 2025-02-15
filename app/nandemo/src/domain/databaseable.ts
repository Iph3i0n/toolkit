import { DatabaseSync, SupportedValueType } from "node:sqlite";

export const database = new DatabaseSync(
  process.env.DATABASE_LOCATION ?? ":memory:"
);

export default abstract class Databaseable {
  protected exec(
    sql: TemplateStringsArray,
    ...args: Array<SupportedValueType>
  ) {
    const invoker = database.prepare(sql.join("?"));
    const result = invoker.run(...args);
    return result.lastInsertRowid;
  }

  protected query(
    sql: TemplateStringsArray,
    ...args: Array<SupportedValueType>
  ) {
    const invoker = database.prepare(sql.join("?"));
    return invoker.all(...args);
  }

  protected get(sql: TemplateStringsArray, ...args: Array<SupportedValueType>) {
    const invoker = database.prepare(sql.join("?"));
    const result = invoker.get(...args);
    if (!result) throw new Error("Could not find " + sql.join("?"));
    return result;
  }
}
