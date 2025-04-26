import { useSelector } from "react-redux";
import {
  selectCurrentUserPost,
  selectPostById,
  selectPostsByUserId,
} from "../features/posts/postSelector";
import { RootState } from "../store/store";

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

export const usePostsByUserId = (userId: string) => {
  const postsData = useSelector((state: RootState) =>
    selectPostsByUserId(state, userId)
  );
  return postsData;
};
