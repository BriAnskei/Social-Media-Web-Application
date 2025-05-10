import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { selectMessagesByConvoId } from "../features/messenger/Message/SelectMessages";

export const useMessegesOnConvoId = (convoId: string) => {
  return useSelector((state: RootState) =>
    selectMessagesByConvoId(state, convoId)
  );
};
