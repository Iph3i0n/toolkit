import { PureRequest } from "@ipheion/puristee";
import { NewAuthService } from "./bootstrap/services/auth-service";
import { Handler } from "./server";
import { AuthService } from "./services/auth-service";
import { IsString } from "@ipheion/safe-type";
import { NewChannelService } from "./bootstrap/services/channel-service";
import { ChannelService } from "./services/channel-service";

type HandlerStart = new (...args: Array<any>) => InstanceType<Handler>;

export function RequireAdmin<THandler extends HandlerStart>(
  subject: THandler,
  _: DecoratorContext
) {
  return class extends subject {
    readonly #auth_service: AuthService;

    constructor(...a: Array<any>) {
      const [auth_service, ...args] = a;
      super(...args);
      this.#auth_service = auth_service ?? NewAuthService(this.State);
    }

    async Process(request: PureRequest) {
      await this.#auth_service.RequireAdmin(request);
      return await super.Process(request);
    }
  };
}

export function RequireUser<THandler extends HandlerStart>(
  subject: THandler,
  _: DecoratorContext
) {
  return class extends subject {
    readonly #auth_service: AuthService;

    constructor(...a: Array<any>) {
      const [auth_service, ...args] = a;
      super(...args);
      this.#auth_service = auth_service ?? NewAuthService(this.State);
    }

    async Process(request: PureRequest) {
      await this.#auth_service.RequireUser(request);
      return await super.Process(request);
    }
  };
}

export function RequireChannel(
  mode: "read" | "write",
  channel_param: string = "channel_id"
) {
  return <THandler extends HandlerStart>(
    subject: THandler,
    _: DecoratorContext
  ) => {
    return class extends subject {
      readonly #channel_service: ChannelService;

      constructor(...a: Array<any>) {
        const [channel_service, ...args] = a;
        super(...args);
        this.#channel_service =
          channel_service ?? NewChannelService(this.State);
      }

      async Process(request: PureRequest) {
        const params = request.Parameters({ [channel_param]: IsString });
        if (mode === "read")
          await this.#channel_service.RequireRead(
            request,
            params[channel_param]
          );
        else if (mode === "write")
          await this.#channel_service.RequireWrite(
            request,
            params[channel_param]
          );
        return await super.Process(request);
      }
    };
  };
}
