import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { UserTypes } from "../../types/user";
import { ApiResponse, userApi } from "../../utils/api";
import { userToken } from "../auth/authSlice";
import { RootState } from "../../store/store";

export const getData = createAsyncThunk(
  "user/getUser",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await userApi.getData(token);

      if (!response.success) {
        return rejectWithValue(response.message || "Fetching failed");
      }

      return response;
    } catch (error) {
      return rejectWithValue("Fetching Failed");
    }
  }
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

    console.log("return api res: ", res);

    return res;
  } catch (error) {
    return rejectWithValue("Editing profile failed");
  }
});

interface userState {
  user: UserTypes;
  loading: boolean;
  error: string | null;
}

const initialState: userState = {
  user: {
    _id: "",
    username: "",
    fullName: "",
    email: "",
    profilePicture: undefined,
    bio: undefined,
    followers: [],
    following: [],
    createdAt: "",
  },
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
      .addCase(getData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getData.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || {
          _id: "",
          username: "",
          fullName: "",
          email: "",
          profilePicture: undefined,
          bio: undefined,
          followers: [],
          following: [],
          createdAt: "",
        };
      })
      .addCase(getData.rejected, (state, action) => {
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
        console.log("Payload logger:", action.payload.user);

        state.user = action.payload.user || initialState.user;
      })
      .addCase(update.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default userSlice.reducer;
