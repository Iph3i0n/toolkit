import { ChannelService } from "local/services/channel-service";
import { b } from "../common";

export const NewChannelService = b((s) => new ChannelService(s));
