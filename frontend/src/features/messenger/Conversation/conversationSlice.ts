import { NormalizeState } from "../../../types/NormalizeType";
import { ConversationType } from "../../../types/MessengerTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import normalizeResponse from "../../../utils/normalizeResponse";
import { MessageApi } from "../../../utils/api";
import { RootState } from "../../../store/store";

interface ConversationState extends NormalizeState<ConversationType> {
  openingConvoLoading: Boolean;
}

const initialState: ConversationState = {
  byId: {},
  allIds: [],
  openingConvoLoading: false,
  loading: false,
  error: null,
};

export const deleteConversation = createAsyncThunk(
  "conversation/drop",
  async (conversationId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.accessToken;
      if (!token) {
        return rejectWithValue(
          "Failed to delete conversation: Token is required to process this request"
        );
      }

      const res = await MessageApi.conversation.drop(token, conversationId);

      return res;
    } catch (error) {
      rejectWithValue("Failed to delete Conversation: " + error);
    }
  }
);

export const fetchAllConvoList = createAsyncThunk(
  "conversation/fetchAll",
  async (_: void, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { accessToken } = state.auth;
      if (!accessToken) {
        return rejectWithValue("No access token to process this request");
      }

      const res = await MessageApi.conversation.getAll(accessToken);
      return res.conversations;
    } catch (error) {
      rejectWithValue("Failed to fetch convo list: " + error || "Error");
    }
  }
);

export interface openConversationPayload {
  otherUser: string;
  contactId: string;
}

export const openConversation = createAsyncThunk(
  "conversation/open",
  async (data: openConversationPayload, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as RootState;
      const token = auth.accessToken;

      if (!token) {
        return rejectWithValue(
          "Failed to open conversation: Token is required to process this request"
        );
      }

      const payload = { ...data, token };
      const res = await MessageApi.conversation.findOrUpdate(payload);

      return res.conversations;
    } catch (error) {
      rejectWithValue("Failed to open conversation: " + error);
    }
  }
);

const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllConvoList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllConvoList.fulfilled, (state, action) => {
        const { byId, allIds } = normalizeResponse(action.payload);

        state.loading = false;
        state.byId = { ...byId };
        state.allIds = allIds;
      })
      .addCase(fetchAllConvoList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(openConversation.pending, (state) => {
        state.openingConvoLoading = true;
        state.error = null;
      })
      .addCase(openConversation.fulfilled, (state, action) => {
        const { byId, allIds } = normalizeResponse(action.payload);

        const isConvoExist = state.allIds.includes(allIds[0]);

        if (!isConvoExist) {
          state.allIds.push(allIds[0]);
          state.byId = { ...state.byId, ...byId };
        }
        state.openingConvoLoading = false;
      })
      .addCase(openConversation.rejected, (state, action) => {
        state.openingConvoLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  // reducer function
} = conversationSlice.actions;
export default conversationSlice.reducer;
