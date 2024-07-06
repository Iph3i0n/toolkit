import { ChannelService } from "local/services/channel-service";
import { b } from "../common";
import { NewAuthService } from "./auth-service";

export const NewChannelService = b(
  (s) => new ChannelService(s, NewAuthService(s))
);
