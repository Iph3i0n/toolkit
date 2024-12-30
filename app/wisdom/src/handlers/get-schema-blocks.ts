import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { i_schema_repository } from "bootstrap/integrations/i-schema-repository";
import ISchemaRepository from "integrations/i-schema-repository";
import { Handler } from "server";

export default class GetBlocks extends Handler {
  readonly #schema_repository: ISchemaRepository;

  constructor(schema_repository: ISchemaRepository = i_schema_repository()) {
    super();
    this.#schema_repository = schema_repository;
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/schema/blocks";

  async Process(request: PureRequest) {
    return new JsonResponse("Ok", await this.#schema_repository.get_blocks());
  }
}
