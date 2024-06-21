import { IProfilePicture } from "$i/i-profile-picture";
import { NewProfilePicture } from "$sso/b/integrations/profile-picture";
import { Handler, Result, State } from "$sso/server";
import {
  EmptyResponse,
  HttpMethod,
  MemoryFileResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";

export default class GetProfilePicture extends Handler {
  readonly #profile_picture: IProfilePicture;

  constructor(
    state: State,
    profile_picture: IProfilePicture = NewProfilePicture(state)
  ) {
    super(state);
    this.#profile_picture = profile_picture;
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/profile/pictures/{userid}";

  async Process(request: PureRequest) {
    const { userid } = request.Parameters({ userid: IsString }) ?? {};
    if (!userid) return new Result(new EmptyResponse("NotFound"));

    const data = await this.#profile_picture.GetPicture(userid);
    if (!data) return new Result(new EmptyResponse("NotFound"));

    return new Result(new MemoryFileResponse(data[1], data[0]));
  }
}
