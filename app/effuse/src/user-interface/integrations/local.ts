import {
  IsArray,
  IsDictionary,
  IsLiteral,
  IsObject,
  IsString,
} from "@ipheion/safe-type";
import { ApiClient } from "./api-client";
import { GrantManager } from "./grant-manager";
import { ServerGrant } from "user-interface/models/server-grant";

export class LocalClient {
  readonly #grant_manager: GrantManager<ServerGrant>;
  readonly #client: ApiClient;

  constructor(base_url: string, grant_manager: GrantManager<ServerGrant>) {
    this.#grant_manager = grant_manager;
    this.#client = new ApiClient(base_url);
  }
}
