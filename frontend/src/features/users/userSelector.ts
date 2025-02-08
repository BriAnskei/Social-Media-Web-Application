import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";
const byId = (state: RootState) => state.user.byId;
const currentUserId = (state: RootState) => state.user.currentUserId;
const loading = (state: RootState) => state.user.loading;
const error = (state: RootState) => state.user.error;

// Filter current user data and send it in the hook
export const selectCurrentUser = createSelector(
  [currentUserId, byId, loading, error],
  (userId, usersById, isLoading, isError) => {
    return {
      // automatically returns the values using () instead of {}
      currentUser:
        userId && usersById
          ? usersById[userId]
          : {
              _id: "",
              username: "",
              fullName: "",
              email: "",
              profilePicture: "",
              bio: "",
              followers: [],
              following: [],
              createdAt: "",
            },
      loading: isLoading,
      error: isError,
    };
  }
);
