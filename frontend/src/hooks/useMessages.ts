import { useSelector } from "react-redux";
import { selectMessageByConversation } from "../features/messenger/Message/messageSelector";
import { RootState } from "../store/store";

export const useMessagesByConversation = (convoId: string) => {
  return useSelector((state: RootState) =>
    selectMessageByConversation(state, convoId)
  );
};
