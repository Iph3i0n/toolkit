import { JsonResponse, PureRequest } from "@ipheion/puristee";
import { Handler, State } from "../server";

export class GetProfile extends Handler {
  Process(request: PureRequest, state: State) {
    const user = state.users;
    return new JsonResponse("Ok", {
    })
  }
}
