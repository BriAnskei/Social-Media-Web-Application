import React, {
  Children,
  createContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { CommentEventPayload } from "../types/PostType";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { addComment } from "../features/posts/postSlice";
import { useSocket } from "../hooks/socket/useSocket";

interface PostModalTypes {
  postId?: string;
  showPostModal: boolean;
  openPostModal: (postId: string) => void;
  onClosePostModal: () => void;

  submitPostComment: (e: React.FormEvent, data: CommentEventPayload) => void;
}

interface ViewPost {
  viewPost: (post: string) => void;
  postId: string;
}

interface ModalContextValue {
  postModal: PostModalTypes;
  postData: ViewPost;
}

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalContext = createContext<ModalContextValue | undefined>(
  undefined
);

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { emitComment } = useSocket();

  const [postId, setPostId] = useState(""); // for view post(latest post) component
  const [postModalData, setPostModalData] = useState<{
    showModal: boolean;
    postId: string;
  }>({
    showModal: false,
    postId: "",
  });

  // SHoww post Modal
  const openPostModal = (postId: string) => {
    setPostModalData((prev) => {
      return {
        ...prev,
        showModal: true,
        postId: postId,
      };
    });
  };
  const onClosePostModal = () => {
    setPostModalData((prev) => {
      return {
        ...prev,
        showModal: false,
      };
    });
  };

  const viewPost = (postId: string) => {
    if (!postId) throw new Error("Error: No Id recieved");
    setPostId(postId);
  };

  const submitPostComment = async (
    e: React.FormEvent,
    data: CommentEventPayload
  ) => {
    e.preventDefault();

    try {
      const res = await dispatch(addComment(data)).unwrap();
      if (res.success) {
        const dataEventPayload: CommentEventPayload = {
          ...data,
          data: res.commentData!,
        };
        emitComment(dataEventPayload);
      }
    } catch (error) {
      console.log("Submitting comment Error: ", error);
    }
  };

  const modalContextValue: ModalContextValue = {
    postModal: {
      postId: postModalData.postId,
      showPostModal: postModalData.showModal,

      openPostModal,
      onClosePostModal,
      submitPostComment,
    },
    postData: {
      viewPost,
      postId,
    },
  };

  return (
    <ModalContext.Provider value={modalContextValue}>
      {children}
    </ModalContext.Provider>
  );
};
