import { IsObject, IsString } from "@ipheion/safe-type";
import Server from "../server";
import { v4 as Guid } from "uuid";
import { Encode } from "../util/jwt";
import { HashPassword } from "../util/password";

const IsBody = IsObject({
  email: IsString,
  name: IsString,
  password: IsString,
});

Server.CreateHandler("/api/v1/users", "post").Register(
  async (request, s, p, c) => {
    if (!IsBody(request.body)) {
      return { status: 400 };
    }

    for (const [_, value] of s.users)
      if (value.email === request.body.email) return { status: 409 };

    const id = Guid();

    return {
      state: {
        users: {
          [id]: {
            email: request.body.email,
            name: request.body.name,
            password: await HashPassword(request.body.password),
            last_login: new Date(),
            roles: [],
          },
        },
      },
      response: {
        status: 200,
        body: {
          data: { token: Encode({ user_id: id }, 3600) },
        },
      },
    };
  }
);
