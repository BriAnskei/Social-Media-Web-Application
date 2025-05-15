import { MessageModel } from "../models/messageModel";

export const deleteMessages = async (
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
};
