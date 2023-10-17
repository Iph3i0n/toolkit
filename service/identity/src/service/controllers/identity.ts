import { IsObject, IsString } from "@ipheion/safe-type";
import Server from "../server";
import { Decode } from "../util/jwt";
import * as Puristee from "@ipheion/puristee";

const IsAuthToken = IsObject({ user_id: IsString });

Server.CreateHandler("/api/v1/token/:token", "get").Register(
  (request, s, p, c) => {
    const token = request.parameters.token;
    if (!IsString(token)) return { status: 407 };
    const decoded = Decode(token);
    if (!IsAuthToken(decoded)) return { status: 407 };

    const user = s.users[decoded.user_id];
    if (!user) return { status: 407 };

    return {
      status: 200,
      data: {
        id: decoded.user_id,
        email: user.email,
        last_login: user.last_login.toISOString(),
      },
    };
  }
);
