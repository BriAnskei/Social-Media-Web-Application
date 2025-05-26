import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Message, SentMessagePayload } from "../../../types/MessengerTypes";
import { NormalizeState } from "../../../types/NormalizeType";
import { exampleMessages } from "../../../assets/assets";
import normalizeResponse from "../../../utils/normalizeResponse";
import { RootState } from "../../../store/store";
import { MessageApi } from "../../../utils/api";

interface MessageState extends NormalizeState<Message> {}

const initialState: MessageState = {
  byId: {},
  allIds: [],
  loading: false,
  error: null,
};

// might also user user Id as a prop to fetch all messages
export const fetchMessagesByConvoId = createAsyncThunk(
  "message/getMesseges",
  async (conversationId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.accessToken;

      if (!token) {
        return rejectWithValue("Failed to fetch messages: No token");
      }

      const res = await MessageApi.message.getMessagesByConvorsationId(
        conversationId,
        token
      );

      return res.messages;
    } catch (error) {
      rejectWithValue("Failed to fetch messages,  " + error);
    }
  }
);

interface sentMessagePayload {
  messageContent: FormData;
  payLoad: SentMessagePayload;
}

export const sentMessage = createAsyncThunk(
  "message/sent",
  async (data: sentMessagePayload, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.accessToken;

      if (!token) {
        return rejectWithValue("Failed to sent message: No token");
      }

      const res = await MessageApi.message.sentMessage(
        data.messageContent,
        data.payLoad
      );

      return res.messages;
    } catch (error) {
      rejectWithValue("Failed to sent message, " + error);
    }
  }
);

const messengerSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    addMessage: (state, action) => {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessagesByConvoId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessagesByConvoId.fulfilled, (state, action) => {
        const { byId, allIds } = normalizeResponse(action.payload);
        state.byId = byId;
        state.allIds = allIds;
        state.loading = false;
      })

      .addCase(sentMessage.fulfilled, (state, action) => {
        const { byId, allIds } = normalizeResponse(action.payload);

        const isDataExist = state.allIds.includes(allIds[0]);

        if (!isDataExist) {
          state.byId = { ...state.byId, ...byId };
          state.allIds.push(allIds[0]);
        }
      })
      .addCase(sentMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  // reducer functions
} = messengerSlice.actions;
export default messengerSlice.reducer;
