import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { selectConversationById } from "../features/messenger/Conversation/conversationSelector";

export const useConversationById = (convoId: string) => {
  const converstionData = useSelector((state: RootState) =>
    selectConversationById(state, convoId)
  );

  return converstionData;
};
