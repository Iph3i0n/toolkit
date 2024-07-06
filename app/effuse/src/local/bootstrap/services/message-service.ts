import { b } from "../common";
import { MessageService } from "local/services/message-service";

export const NewMessageService = b((s) => new MessageService(s));
