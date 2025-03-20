import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";
import { FetchedUserType } from "../../types/user";
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

export const selectUserById = createSelector(
  [byId, (_state: RootState, userId: string) => userId],
  (userIds, id) => userIds[id] || ({} as FetchedUserType)
);

export const selectUsersByIds = createSelector(
  [byId, (_, ids: string[]) => ids],
  (users, ids) =>
    ids.reduce((acc, id) => {
      acc[id] = users[id]; // Assuming users are stored as an object with userId as keys
      return acc;
    }, {} as { [key: string]: FetchedUserType })
);
