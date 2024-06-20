import { GetProfile } from "./handlers/get-profile";
import { Server } from "./server";

Server.WithHandler("/api/v1/user/profile", "GET", GetProfile);
Server.WithHandler("/api/v1/users/{userId}/profile", "GET", GetProfile);

Server.Listen(3000);