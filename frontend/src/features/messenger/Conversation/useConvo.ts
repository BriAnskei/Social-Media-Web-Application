import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { selectUnreadCount } from "./selectConvo";

export const useUnreadCount = (currUser: string) => {
  return useSelector((state: RootState) => selectUnreadCount(state, currUser));
};
