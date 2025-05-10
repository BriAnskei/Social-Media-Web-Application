import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Message } from "../../../types/MessengerTypes";
import { NormalizeState } from "../../../types/NormalizeType";
import { exampleMessages } from "../../../assets/assets";
import normalizeResponse from "../../../utils/normalizeResponse";

interface MessageState extends NormalizeState<Message> {}

const initialState: MessageState = {
  byId: {},
  allIds: [],
  loading: false,
  error: null,
};

// might also user user Id as a prop to fetch all messages
export const fetchAllMesseges = createAsyncThunk(
  "message/getMesseges",
  async (_: void, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return exampleMessages;
    } catch (error) {
      rejectWithValue("Error fetching messeges: " + error);
    }
  }
);

export const fetchMessageOnConvo = createAsyncThunk(
  ",essage/getConvoMesseges",
  async (convoId: string, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return exampleMessages.filter((msg) => msg.conversationId === convoId);
    } catch (error) {
      rejectWithValue("Error fecthing convo messages: " + error || "Error");
    }
  }
);

const messengerSlice = createSlice({
  name: "message",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMesseges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMesseges.fulfilled, (state, action) => {
        const { byId, allIds } = normalizeResponse(action.payload);
        state.loading = false;
        state.byId = byId;
        state.allIds = allIds;
      });
  },
});

export const {
  // reducer functions
} = messengerSlice.actions;
export default messengerSlice.reducer;
