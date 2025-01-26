import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { FetchedUserType, UserState } from "../../types/user";
import { ApiResponse, userApi } from "../../utils/api";
import { RootState } from "../../store/store";

export const getUserData = createAsyncThunk(
  "user/getUser",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await userApi.getData(token); // get user data

      if (!response.success) {
        return rejectWithValue(response.message || "Fetching failed");
      }

      return response;
    } catch (error) {
      return rejectWithValue("Fetching Failed");
    }
  }
);

export const allUserData = createAsyncThunk(
  "user/getAllUserData",
  async () => {}
);

export const update = createAsyncThunk<
  ApiResponse,
  FormData,
  { state: RootState }
>("user/update", async (data: FormData, { rejectWithValue }) => {
  const token = localStorage.getItem("token");

  if (!token) return rejectWithValue("Unauthorize ");

  try {
    const res = await userApi.updateProfile(token, data);

    if (!res.success)
      return rejectWithValue(res.message || "Editing profile failed");

    return res;
  } catch (error) {
    return rejectWithValue("Editing profile failed");
  }
});

const initialState: UserState = {
  byId: {},
  allIds: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getData casses
      .addCase(getUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserData.fulfilled, (state, action) => {
        const user = action.payload.user as FetchedUserType;
        state.loading = false;
      })
      .addCase(getUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update cases
      .addCase(update.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(update.fulfilled, (state, action) => {
        state.loading = false;

        state.user = action.payload.user || initialState.user;
      })
      .addCase(update.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default userSlice.reducer;
