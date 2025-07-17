import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import {
  selectConversationById,
  selectUnReadConvo,
} from "../features/messenger/Conversation/conversationSelector";
import { selectChatWindows } from "../Components/Modal/globalSelector";

export const useConversationById = (convoId: string) => {
  const converstionData = useSelector((state: RootState) =>
    selectConversationById(state, convoId)
  );

  return converstionData;
};

// Data is from global state
export const useWindowedConversation = () => {
  const convoWindows = useSelector((state: RootState) =>
    selectChatWindows(state)
  );

  return convoWindows;
};

export const useUnreadConversation = () => {
  return useSelector((state: RootState) => selectUnReadConvo(state));
};
