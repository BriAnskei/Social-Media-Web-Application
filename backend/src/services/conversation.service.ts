import { Conversation } from "../models/conversationModel";

export const updateConversationOnMessage = async (
  conversationId: string,
  recipentId: string,
  newMessageId: string
) => {
  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation || !newMessageId) {
      throw new Error(
        "Conversation does not exist for sending this message or message id might be undifined"
      );
    }

    return await Conversation.updateOne(
      {
        _id: conversation._id,
        "unreadCounts.user": recipentId,
      },
      {
        $inc: { "unreadCounts.$.count": 1 }, // using  positional $ operator  in which index is to update
        lastMessage: newMessageId,
        lastMessageAt: new Date(),
      }
    );
  } catch (error) {
    throw new Error(`Failed to delete messages: ${(error as Error).message}`);
  }
};
