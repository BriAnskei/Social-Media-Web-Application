import { useSelector } from "react-redux";
import {
  selectCurrentUserPost,
  selectPostById,
} from "../features/posts/postSelector";
import { RootState } from "../store/store";
import { FetchPostType } from "../types/PostType";

export const useCurrentUserPosts = () => {
  const result = useSelector(selectCurrentUserPost);
  return result;
};

export const usePostById = (postId: string) => {
  const postData = useSelector((state: RootState) =>
    selectPostById(state, postId)
  );
  return postData;
};
