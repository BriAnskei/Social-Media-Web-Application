import {
  createAsyncThunk,
  createSlice,
  current,
  PayloadAction,
} from "@reduxjs/toolkit";
import { NormalizeState } from "../../types/NormalizeType";
import { normalizeResponse } from "../../utils/normalizeResponse";
import { NotificationType } from "../../types/NotificationTypes";
import { RootState } from "../../store/store";
import { notificationApi } from "../../utils/api";

export interface NotifData {
  isExist: boolean;
  data: NotificationType;
}

interface NotificationState extends NormalizeState<NotificationType> {}

const initialState: NotificationState = {
  byId: {},
  allIds: [],
  loading: false,
  error: null,
};

export const fetchAllNotifs = createAsyncThunk(
  "notification/get",
  async (_: void, { getState }) => {
    const { auth } = getState() as RootState;
    const accessToken = auth.accessToken;

    if (!accessToken) throw new Error("Access token is required");

    try {
      const res = await notificationApi.fetchAllNotif(accessToken);

      if (!res.success) {
        console.error("Notif fetching error: ", res.message);
        return;
      }

      return res.notifications;
    } catch (error) {
      console.error("Notif fetching error: ", error);
    }
  }
);

export const markAllRead = createAsyncThunk(
  "notification/set-read",
  async (allIds: string[], { getState }) => {
    if (allIds.length === 0) return; // exit the function if array has no value

    try {
      const { auth } = getState() as RootState;
      const accessToken = auth.accessToken;

      if (!accessToken) throw new Error("Access token is required");
      const res = await notificationApi.setReadNotif(accessToken, allIds);
      if (!res.success) {
        console.error("Faild to set-read notif: ", res.message);
        return;
      }
    } catch (error) {
      console.error("Notif setRead error: ", error);
    }
  }
);

export const removeNotifList = createAsyncThunk(
  "notification/delete-notif",
  async (postId: string, { getState, dispatch, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      const token = auth.accessToken;

      if (!token || !postId)
        return rejectWithValue("No token or post ID to process this request");

      const res = await notificationApi.removeList(postId, token);

      if (!res.success) {
        rejectWithValue(res.message || "Failed to delete notif list");
        return;
      }

      dispatch(deleteList(postId));

      return res;
    } catch (error) {
      rejectWithValue("Delete notif list error: " + error);
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addOrDropNotification: (state, action: PayloadAction<NotifData>): void => {
      // used in socket
      const { isExist, data } = action.payload;
      const { byId, allIds } = normalizeResponse(data);

      console.log("NEW NOTIFICATION PAYLOAD: ", byId);

      // if data exist, remove. Otherwise add the data to state
      if (!isExist) {
        if (!state.allIds.includes(allIds[0])) {
          state.allIds.unshift(allIds[0]);
        }

        state.byId = { ...byId, ...state.byId };
      } else {
        state.allIds = [...state.allIds.filter((id) => id !== allIds[0])];
        delete state.byId[allIds[0]];
      }
    },
    deleteList: (state, action) => {
      const postId = action.payload;

      const idListToRemove = Object.keys(state.byId).filter(
        (id) => state.byId[id].post === postId
      );

      state.allIds = state.allIds.filter((id) => !idListToRemove.includes(id));

      for (let id of idListToRemove) {
        delete state.byId[id];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllNotifs.pending, (state) => {
        state.error = null;
        state.loading = true;
      })
      .addCase(fetchAllNotifs.fulfilled, (state, action) => {
        const NotifData = normalizeResponse(action.payload);

        // reset first
        state.allIds = [];
        state.byId = {};

        state.allIds = NotifData.allIds;
        state.byId = NotifData.byId;
        state.error = null;
        state.loading = false;
      })
      .addCase(fetchAllNotifs.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })

      // Set-read
      .addCase(markAllRead.pending, (state) => {
        state.error = null;
        state.loading = true;
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.error = null;
        state.loading = false;
        state.allIds.forEach((id) => {
          state.byId[id].read = true;
        });
      })
      .addCase(markAllRead.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })

      // delete notifs
      .addCase(removeNotifList.pending, (state) => {
        state.error = null;
        state.loading = true;
      })
      .addCase(removeNotifList.fulfilled, (state) => {
        state.error = null;
        state.loading = false;
      })
      .addCase(removeNotifList.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

export const { addOrDropNotification, deleteList } = notificationSlice.actions;
export default notificationSlice.reducer;
