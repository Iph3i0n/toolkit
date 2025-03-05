import Env from "env";
import { DatabaseSync, SupportedValueType } from "node:sqlite";

const location = Env.Find("DATABASE_LOCATION") ?? ":memory:";

export const database = new DatabaseSync(location);

export default abstract class Databaseable {
  static exec(sql: ReadonlyArray<string>, ...args: Array<SupportedValueType>) {
    const invoker = database.prepare(sql.join("?"));
    const result = invoker.run(...args);
    return result.lastInsertRowid;
  }

  static query(sql: ReadonlyArray<string>, ...args: Array<SupportedValueType>) {
    const invoker = database.prepare(sql.join("?"));
    return invoker.all(...args);
  }

  static get(sql: ReadonlyArray<string>, ...args: Array<SupportedValueType>) {
    const invoker = database.prepare(sql.join("?"));
    const result = invoker.get(...args);
    if (!result) throw new Error("Could not find " + sql.join("?"));
    return result;
  }

  protected exec(
    sql: ReadonlyArray<string>,
    ...args: Array<SupportedValueType>
  ) {
    return Databaseable.exec(sql, ...args);
  }

  protected query(
    sql: ReadonlyArray<string>,
    ...args: Array<SupportedValueType>
  ) {
    return Databaseable.query(sql, ...args);
  }

  protected get(
    sql: ReadonlyArray<string>,
    ...args: Array<SupportedValueType>
  ) {
    return Databaseable.get(sql, ...args);
  }
}
