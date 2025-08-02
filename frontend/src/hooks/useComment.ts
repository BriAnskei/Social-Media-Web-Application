import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { selectComment } from "../features/comment/commentSelector";

export const useComment = (postId: string) => {
  return useSelector((state: RootState) => selectComment(state, postId));
};
