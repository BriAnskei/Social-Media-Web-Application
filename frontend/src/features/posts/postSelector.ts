import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";

const byId = (state: RootState) => state.posts.byId;
const allIds = (state: RootState) => state.posts.allIds;
const currentUserId = (state: RootState) => state.user.currentUserId;
const postLoading = (state: RootState) => state.posts.loading;
const userLoading = (state: RootState) => state.user.loading;

export const selectCurrentUserPost = createSelector(
  [byId, allIds, currentUserId, postLoading, userLoading],
  (postById, allIds, currentUserId, postLoading, userLoading) => {
    const currentUsersPost = allIds
      .filter((id) => postById[id].user === currentUserId)
      .map((id) => postById[id]);

    return {
      currentUserPosts:
        currentUsersPost.length > 0
          ? currentUsersPost
          : [
              {
                _id: "",
                user: "",
                content: "",
                image: "",
                likes: [],
                comments: [],
                createdAt: "",
              },
            ],
      loading: postLoading || userLoading,
    };
  }
);

// // Optional: Add a selector to get a single user post by ID
// export const selectPostById = createSelector(
//   [byId, (_, postId: string) => postId],
//   (postById, postId) => postById[postId] || null
// );
