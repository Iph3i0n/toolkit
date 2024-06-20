import { GetProfile } from "./handlers/get-profile";
import { GetPublicProfile } from "./handlers/get-public-profile";
import { GetPushSubscriptions } from "./handlers/get-push-scriptions";
import { GetUserFromToken } from "./handlers/get-user-from-token";
import { Server } from "./server";

Server.WithHandler("/api/v1/user/profile", "GET", GetProfile);
Server.WithHandler("/api/v1/users/{userId}/profile", "GET", GetPublicProfile);
Server.WithHandler(
  "/api/v1/user/push-subscriptions",
  "GET",
  GetPushSubscriptions
);
Server.WithHandler("/api/v1/auth/user", "GET", GetUserFromToken);

Server.Listen(3000);
