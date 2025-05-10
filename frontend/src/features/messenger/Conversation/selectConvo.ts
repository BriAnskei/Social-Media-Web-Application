import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../../store/store";

const allIds = (state: RootState) => state.conversation.allIds;
const byId = (state: RootState) => state.conversation.byId;

export const selectUnreadCount = createSelector(
  [byId, allIds, (_, currUser: string) => currUser],
  (byId, allIds, currUser) => {
    let totalCount = 0;

    for (let id of allIds) {
      totalCount +=
        byId[id].unreadCounts.find((ur) => ur.user === currUser)?.count || 0;
    }
    return totalCount;
  }
);
