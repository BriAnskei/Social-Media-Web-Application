import { NormalizeState } from "../../../types/NormalizeType";
import { Conversation } from "../../../types/MessengerTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { exampleConversations } from "../../../assets/assets";
import normalizeResponse from "../../../utils/normalizeResponse";

interface ConversationState extends NormalizeState<Conversation> {}

const initialState: ConversationState = {
  byId: {},
  allIds: [],
  loading: false,
  error: null,
};

export const fetchAllConvoList = createAsyncThunk(
  "conversation/fetchAll",
  async (userId: string, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const convoList = exampleConversations.filter((convo) =>
        convo.participants.includes(userId)
      );

      return convoList;
    } catch (error) {
      rejectWithValue("Failed to fetch convo list: " + error || "Error");
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
        state.byId = byId;
        state.allIds = allIds;
      });
  },
});

export const {
  // reducer function
} = conversationSlice.actions;
export default conversationSlice.reducer;
