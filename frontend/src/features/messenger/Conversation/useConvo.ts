import { useSelector } from "react-redux";
import { selectConversationByContactId } from "./selectConvo";
import { RootState } from "../../../store/store";

export const useConversationByContactId = (contactId: string) => {
  const converstionData = useSelector((state: RootState) =>
    selectConversationByContactId(state, contactId)
  );

  return converstionData;
};
