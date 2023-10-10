import CreateServer, { Provider } from "@ipheion/puristee";
import { ASCII } from "@ipheion/moulding-tin";

const Server = CreateServer("./data", {
  data: new ASCII(),
});

Server.CreateHandler("/hello", "get").Register((request, s, p, c) => {
  return {
    response: { status: 200, body: { message: s.data } },
  };
});

Server.CreateHandler("/hello", "put").Register((request, s, p, c) => {
  return {
    response: { status: 200, body: { message: s.data } },
    state: { data: { test: "world" } },
  };
});
