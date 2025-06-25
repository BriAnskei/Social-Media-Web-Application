import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../../store/store";
import { ConversationType } from "../../../types/MessengerTypes";

const byId = (state: RootState) => state.conversation.byId;
const allIds = (state: RootState) => state.conversation.allIds;

export const selectConversationById = createSelector(
  [byId, (_: RootState, convoId: string): string => convoId],
  (byId, convoId) => byId[convoId] || ({} as ConversationType)
);

export const selectConversationByContactId = createSelector(
  [byId, allIds, (_: RootState, contactId: string): string => contactId],
  (byId, allIds, contactId): ConversationType | undefined => {
    const matchId = allIds.find((id) => byId[id]?.contactId === contactId);
    return matchId ? byId[matchId] : undefined;
  }
);

export const selectConsationsByContactIds = createSelector(
  [byId, (_: RootState, convoIds: string[]): string[] => convoIds],
  (byId, convoIds) =>
    convoIds.reduce((acc, id) => {
      acc[id] = byId[id];
      return acc;
    }, {} as { [key: string]: ConversationType })
);
