import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  userId: string;
}

const selectToken = (state: RootState) => state.auth.token;

const selectUsersById = (state: RootState) => state.user.byId;

export const selectToUserId = createSelector([selectToken], (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.userId;
  } catch (error) {
    console.log(error);
    return null;
  }
});

export const selectCurrecyUser = createSelector(
  [selectToUserId, selectUsersById],
  (userId, usersById) => {
    if (!userId || !usersById) return null;
    return usersById[userId] || null;
  }
);
