import { IsObject, IsString } from "@ipheion/safe-type";
import Server from "../server";
import { HashPassword, IsMatch } from "../util/password";

const IsBody = IsObject({
  email: IsString,
  password: IsString,
});

Server.CreateHandler("/api/v1/users/:id/password", "post").Register(
  async (request, s, p, c) => {
    const id = request.parameters.id;
    if (!IsString(id)) return { status: 400 };
    if (!IsBody(request.body)) return { status: 400 };

    const user = s.users[id];
    if (!user || !(await IsMatch(request.body.password, user.password))) {
      return { status: 407 };
    }

    return {
      state: {
        users: {
          [id]: {
            ...user,
            email: await HashPassword(request.body.email),
          },
        },
      },
      response: {
        status: 200,
        body: {},
      },
    };
  }
);
