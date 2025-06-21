import { IMessage } from "../../models/messageModel";

interface messagePayload {
  recipientId: string;
  convoIdAsRoom: string;
  message: IMessage;
}
