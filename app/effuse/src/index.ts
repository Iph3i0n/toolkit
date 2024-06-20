import { GetProfile } from "./handlers/get-profile";
import { GetPublicProfile } from "./handlers/get-public-profile";
import { GetPushSubscriptions } from "./handlers/get-push-scriptions";
import { Server } from "./server";

Server.WithHandler("/api/v1/user/profile", "GET", GetProfile);
Server.WithHandler("/api/v1/users/{userId}/profile", "GET", GetPublicProfile);
Server.WithHandler(
  "/api/v1/user/push-subscriptions",
  "GET",
  GetPushSubscriptions
);

Server.Listen(3000);
