import { Config } from "types/config";

export default interface IConfigRepository {
  GetConfig(): Promise<Config>;
}
