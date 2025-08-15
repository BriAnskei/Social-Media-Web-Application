import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";
const byId = (state: RootState) => state.notification.byId;
const allIds = (state: RootState) => state.notification.allIds;

export const selectUnreadNotif = createSelector(
  [byId, allIds],
  (byId, allIds) => allIds.filter((id) => byId[id].read === false)
);
