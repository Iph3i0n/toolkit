import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { RequireChannel } from "local/authorise";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { Handler, Result } from "local/server";
import { AuthService } from "local/services/auth-service";

@RequireChannel("read")
export default class DeleteParticipant extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Delete;
  readonly Url = "/api/v1/channels/:channel_id/events/:id/participants";

  async Process(request: PureRequest) {
    const { user_id } = await this.#auth_service.GetUser(request);
    if (!user_id) return new EmptyResponse("Unauthorised");
    const { id } = request.Parameters({ id: IsString });

    const existing = this.State.calendar_events[id];
    if (!existing) return new EmptyResponse("NotFound");
    return new Result(new JsonResponse("Created", {}), {
      calendar_events: {
        [id]: {
          ...existing,
          attending: existing.attending.filter((a) => a !== user_id),
        },
      },
    });
  }
}
