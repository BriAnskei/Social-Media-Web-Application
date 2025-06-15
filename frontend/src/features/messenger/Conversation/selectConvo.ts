import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../../store/store";
import { ConversationType } from "../../../types/MessengerTypes";

const byId = (state: RootState) => state.conversation.byId;
const allIds = (state: RootState) => state.conversation.allIds;

export const selectConversationByContactId = createSelector(
  [byId, allIds, (_: RootState, contactId: string): string => contactId],
  (byId, allIds, contactId): ConversationType | undefined => {
    const matchId = allIds.find((id) => byId[id]?.contactId === contactId);
    return matchId ? byId[matchId] : undefined;
  }
);
