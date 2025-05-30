import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { i_schema_repository } from "bootstrap/integrations/i-schema-repository";
import ISchemaRepository from "integrations/i-schema-repository";
import { Handler } from "server";
import { Authenticated } from "utils/authenticate";

export default class extends Handler {
  readonly #schema_repository: ISchemaRepository;

  constructor(schema_repository: ISchemaRepository = i_schema_repository()) {
    super();
    this.#schema_repository = schema_repository;
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/schema/blocks";

  @Authenticated
  async Process(request: PureRequest) {
    return new JsonResponse("Ok", await this.#schema_repository.get_blocks());
  }
}
