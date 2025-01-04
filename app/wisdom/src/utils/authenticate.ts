import { EmptyResponse, PureRequest } from "@ipheion/puristee";
import Jwt from "jsonwebtoken";
import { Handler } from "server";

const secret = process.env.SECRET_KEY ?? "test";
const users = process.env.USER_NAMES?.split(",") ?? ["test"];
const passwords = process.env.USER_PASSWORDS?.split(",") ?? ["test"];

type HandlerFunction = (request: PureRequest) => any;

export function Authenticated(
  original: HandlerFunction,
  context: ClassMethodDecoratorContext<Handler, HandlerFunction>
) {
  return function (this: Handler, request: PureRequest) {
    try {
      const token = request.headers.authorization?.replace("Bearer ", "");
      if (!token) return new EmptyResponse("Unauthorised");

      const decoded = Jwt.verify(token, secret);
      if (typeof decoded === "string") return new EmptyResponse("Unauthorised");
      const user_id = decoded.user_id;
      if (!user_id) return new EmptyResponse("Unauthorised");
      if (!users.find((u) => u === user_id))
        return new EmptyResponse("Unauthorised");
    } catch (err) {
      console.error(err);
      return new EmptyResponse("Unauthorised");
    }

    return original.bind(this, request)();
  } as any;
}

export function Login(username: string, password: string) {
  const expected_password = passwords[users.findIndex((u) => u === username)];
  if (!expected_password || password !== expected_password) return undefined;

  return Jwt.sign({ user_id: username }, secret, { expiresIn: "1d" });
}
