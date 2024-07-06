import { b } from "../common";
import { MessageService } from "local/services/message-service";

export const NewMessageService = b(() => new MessageService());
