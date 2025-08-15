import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentUserPost,
  selectPostById,
  selectPostsByUserId,
} from "../features/posts/postSelector";
import { AppDispatch, RootState } from "../store/store";
import { useCallback, useEffect } from "react";
import { fetchAllPost, resetData } from "../features/posts/postSlice";

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

export function usePosts() {
  const dispatch: AppDispatch = useDispatch();
  const { byId, allIds, loading, fetchingMore, hasMore } = useSelector(
    (state: RootState) => state.posts
  );

  const fetchPosts = useCallback(
    async (cursor?: string) => {
      await dispatch(fetchAllPost(cursor ? { cursor } : {}));
    },
    [dispatch]
  );

  return {
    posts: byId,
    postIds: allIds,
    loading,
    fetchingMore,
    hasMore,
    fetchPosts,
  };
}
