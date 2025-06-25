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

export interface ViewImageState {
  show: boolean;
  src: string;
}

export interface ViewUserFollow {
  show: boolean;
}

export interface ChatWindowType {
  conversationId: string;
  participantId: string;
  minimized: boolean;
}

export interface ViewMessageImage {
  show: boolean;
  url: string;
}

export interface GlobalState {
  postModal: PostModalState;
  postData: PostDataState;
  editPostModal: EditPostModalState;
  deletePostModal: DeletePostModalState;
  viewFollow: ViewUserFollow;
  editProfileModal: EditProfileModalState;
  viewProfile: ViewProfileState;

  // image(profile photos) display modal
  viewImageModal: ViewImageState;

  // chat window
  chatWindows: ChatWindowType[];
  viewMessageImage: ViewMessageImage;
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
  viewFollow: {
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

  viewImageModal: {
    show: false,
    src: "",
  },

  chatWindows: [],
  viewMessageImage: {
    show: false,
    url: "",
  },
};

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

    viewImage: (state, action) => {
      const { src } = action.payload;
      state.viewImageModal.show = true;
      state.viewImageModal.src = src;
    },
    viewImageClose: (state) => {
      state.viewImageModal.show = false;
      state.viewImageModal.src = "";
    },
    toggleViewFollow: (state) => {
      state.viewFollow.show = !state.viewFollow.show;
    },
    openChatWindow: (state, action) => {
      const { conversationId, participantId } = action.payload;

      const isWindowExist = state.chatWindows.findIndex(
        (chatWindow) => chatWindow.conversationId === conversationId
      );
      if (isWindowExist !== -1) {
      } else {
        const chatWindowPayload: ChatWindowType = {
          conversationId,
          participantId,
          minimized: false,
        };

        state.chatWindows.push(chatWindowPayload);
      }
    },
    closeWindow: (state, action) => {
      const { conversationId } = action.payload;

      console.log("SLICE CONVOiD id: ", conversationId);

      state.chatWindows = state.chatWindows.filter(
        (chatWindow) => chatWindow.conversationId !== conversationId
      );
    },
    toggleMinimize: (state, action) => {
      const { conversationId } = action.payload;

      state.chatWindows.map((chatWindow) => {
        if (chatWindow.conversationId === conversationId) {
          chatWindow.minimized = !chatWindow.minimized;
        }
      });
    },

    toggleViewMessageImage: (state, action) => {
      const isImageIsViewed =
        Boolean(state.viewMessageImage.url) && state.viewMessageImage.show;

      if (isImageIsViewed) {
        state.viewMessageImage.show = false;
        state.viewMessageImage.url = "";
      } else {
        const url = action.payload;

        state.viewMessageImage.show = true;
        state.viewMessageImage.url = url;
      }
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
  toggleViewFollow,

  viewImage,
  viewImageClose,

  openChatWindow,
  closeWindow,
  toggleMinimize,

  toggleViewMessageImage,
} = globalSlice.actions;
export default globalSlice.reducer;
