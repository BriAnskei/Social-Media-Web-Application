import { openChatWindow } from "../Components/Modal/globalSlice";
import {
  openConversationPayload,
  openConversation,
} from "../features/messenger/Conversation/conversationSlice";
import { AppDispatch } from "../store/store";
import { ConversationType } from "../types/MessengerTypes";

export class ConversationService {
  static async fetchAndOpenConversation(
    participantId: string,
    contactId: string,
    dispatch: AppDispatch
  ): Promise<ConversationType | null> {
    const data: openConversationPayload = {
      otherUser: participantId,
      contactId,
    };

    try {
      const res = await dispatch(openConversation(data)).unwrap();
      const convoData = res?.conversations as ConversationType;

      const chatWindowPayload = {
        conversationId: convoData._id,
        participantId,
      };

      dispatch(openChatWindow(chatWindowPayload));

      return convoData;
    } catch (error) {
      throw new Error(
        `Failed to fetchAndOpenConversation: ${(error as Error).message}`
      );
    }
  }
}
