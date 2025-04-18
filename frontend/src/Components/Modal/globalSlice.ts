import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FetchedUserType } from "../../types/user";

// post states
export interface PostModalState {
  postId: string;
  showPostModal: boolean;
}

export interface PostDataState {
  postId: string;
}

export interface EditPostModalState {
  postId: string;
  show: boolean;
}

export interface DeletePostModalState {
  postId: string;
  show: boolean;
}

// profile states
export interface EditProfileModalState {
  data: FetchedUserType;
  show: boolean;
}

export interface ViewProfileState {
  userData: FetchedUserType;
}

export interface GlobalState {
  postModal: PostModalState;
  postData: PostDataState;
  editPostModal: EditPostModalState;
  deletePostModal: DeletePostModalState;

  editProfileModal: EditProfileModalState;
  viewProfile: ViewProfileState;
}

// Initialize state
const initialState: GlobalState = {
  postModal: {
    postId: "",
    showPostModal: false,
  },
  postData: {
    postId: "",
  },

  editPostModal: {
    postId: "",
    show: false,
  },
  deletePostModal: {
    postId: "",
    show: false,
  },

  editProfileModal: {
    data: {} as FetchedUserType,
    show: false,
  },

  viewProfile: {
    userData: {} as FetchedUserType,
  },
};

// Define payload types for actions that need complex data

// Create the slice
const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    // post reducers
    openPostModal: (state, action: PayloadAction<string>) => {
      state.postModal.showPostModal = true;
      state.postModal.postId = action.payload;
    },
    closePostModal: (state) => {
      state.postModal.showPostModal = false;
    },
    viewPost: (state, action: PayloadAction<string>) => {
      if (!action.payload) throw new Error("Error: No Id received");
      state.postData.postId = action.payload;
    },

    toggleEditModal: (state, action: PayloadAction<string | null>) => {
      console.log("toggle edit: ", action.payload);
      state.editPostModal.show = !state.editPostModal.show;
      state.editPostModal.postId = action.payload || "";
    },
    toggleDeleteModal: (state, action: PayloadAction<string | null>) => {
      state.deletePostModal.show = !state.deletePostModal.show;
      state.deletePostModal.postId = action.payload || "";
    },

    // profile reducers
    openEditProfileModal: (state, action: PayloadAction<FetchedUserType>) => {
      state.editProfileModal.data = action.payload;
      state.editProfileModal.show = true;
    },
    closeEditProfileModal: (state) => {
      state.editProfileModal.show = false;
    },
    viewProfile: (state, action: PayloadAction<FetchedUserType>) => {
      state.viewProfile.userData = action.payload;
    },
  },
});

// Export actions
export const {
  openPostModal,
  closePostModal,
  viewPost,
  closeEditProfileModal,
  toggleEditModal,
  toggleDeleteModal,

  openEditProfileModal,
  viewProfile,
} = globalSlice.actions;
export default globalSlice.reducer;
