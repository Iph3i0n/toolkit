import { IsObject, IsString } from "@ipheion/safe-type";
import Server from "../server";
import { v4 as Guid } from "uuid";
import { Encode } from "../util/jwt";
import { HashPassword, IsMatch } from "../util/password";

const IsBody = IsObject({
  old_password: IsString,
  password: IsString,
});

Server.CreateHandler("/api/v1/users/:id/password", "post").Register(
  async (request, s, p, c) => {
    const id = request.parameters.id;
    if (!IsString(id)) return { status: 400 };
    if (!IsBody(request.body)) return { status: 400 };

    const user = s.users[id];
    if (!user || !(await IsMatch(request.body.old_password, user.password))) {
      return { status: 407 };
    }

    return {
      state: {
        users: {
          [id]: {
            ...user,
            password: await HashPassword(request.body.password),
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
