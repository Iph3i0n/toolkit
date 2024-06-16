import { IsString } from "@ipheion/safe-type";
import Server from "../server";
import { Encode } from "../util/jwt";
import { IsMatch } from "../util/password";

Server.CreateHandler("/api/v1/token", "get").Register(
  async (request, s, p, c) => {
    const email = request.parameters.email;
    const password = request.parameters.password;
    if (!IsString(email) || !IsString(password)) return { status: 400 };

    for (const [id, value] of s.users) {
      if (value.email !== email) continue;

      if (!(await IsMatch(password, value.password))) return { status: 407 };
      return { status: 200, data: { token: Encode({ user_id: id }, 3600) } };
    }

    return { status: 407 };
  }
);
