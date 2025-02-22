import Env from "env";
import { DatabaseSync, SupportedValueType } from "node:sqlite";

export const database = new DatabaseSync(
  Env.Find("DATABASE_LOCATION") ?? ":memory:"
);

export default abstract class Databaseable {
  protected static exec(
    sql: TemplateStringsArray,
    ...args: Array<SupportedValueType>
  ) {
    const invoker = database.prepare(sql.join("?"));
    const result = invoker.run(...args);
    return result.lastInsertRowid;
  }

  protected static query(
    sql: TemplateStringsArray,
    ...args: Array<SupportedValueType>
  ) {
    const invoker = database.prepare(sql.join("?"));
    return invoker.all(...args);
  }

  protected static get(
    sql: TemplateStringsArray,
    ...args: Array<SupportedValueType>
  ) {
    const invoker = database.prepare(sql.join("?"));
    const result = invoker.get(...args);
    if (!result) throw new Error("Could not find " + sql.join("?"));
    return result;
  }

  protected exec(
    sql: TemplateStringsArray,
    ...args: Array<SupportedValueType>
  ) {
    return Databaseable.exec(sql, ...args);
  }

  protected query(
    sql: TemplateStringsArray,
    ...args: Array<SupportedValueType>
  ) {
    return Databaseable.query(sql, ...args);
  }

  protected get(sql: TemplateStringsArray, ...args: Array<SupportedValueType>) {
    return Databaseable.get(sql, ...args);
  }
}
