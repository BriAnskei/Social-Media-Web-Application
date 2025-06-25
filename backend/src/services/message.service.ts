import { appEvents } from "../events/appEvents";
import { IMessage, MessageModel } from "../models/messageModel";
export const messageService = {
  emitMessageOnSend: (data: {
    conversationId: string;
    messageData: IMessage;
  }) => {
    appEvents.emit("message_on_sent", data);
  },
  deleteMessages: async (
    isPermanent: boolean,
    conversationId: string,
    userId: string
  ) => {
    try {
      let result,
        success = false;
      if (isPermanent) {
        result = await MessageModel.deleteMany({ conversationId });
        success = result.acknowledged;
      } else {
        result = await MessageModel.updateMany(
          { conversationId },
          { hideFrom: userId }
        );
        success = result.acknowledged;
      }

      return { result, success };
    } catch (error) {
      throw new Error(`Failed to delete messages: ${(error as Error).message}`);
    }
  },

  markReadMessages: async (conversationId: string, userId: string) => {
    try {
      const result = await MessageModel.updateMany(
        { conversationId, recipient: userId, read: false },
        { read: true, readAt: Date.now() }
      );

      return result;
    } catch (error) {
      throw new Error(
        `Failed to mark as read messages: ${(error as Error).message}`
      );
    }
  },
};
