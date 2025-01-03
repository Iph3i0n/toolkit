import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { n_schema_service } from "bootstrap/services/schema-service";
import { Handler } from "server";
import SchemaService from "services/schema-service";
import { Authenticated } from "utils/authenticate";

export default class extends Handler {
  readonly #schema_service: SchemaService;

  constructor(schema_service: SchemaService = n_schema_service()) {
    super();
    this.#schema_service = schema_service;
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/schema/blocks/:id";

  @Authenticated
  async Process(request: PureRequest) {
    return new JsonResponse(
      "Ok",
      await this.#schema_service.get_block(
        request.Parameters({ id: IsString }).id
      )
    );
  }
}
