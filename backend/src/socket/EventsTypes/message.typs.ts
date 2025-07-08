import { IMessage } from "../../models/messageModel";

export interface messagePayload {
  recipientId: string;
  convoIdAsRoom: string;
  message: IMessage;
}
