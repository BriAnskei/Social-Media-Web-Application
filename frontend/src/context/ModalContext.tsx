import React, { Children, createContext, ReactNode, useState } from "react";
import { CommentEventPayload, CommentType } from "../types/PostType";
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

interface ModalContextValue {
  postModal: PostModalTypes;
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

  const submitPostComment = async (
    e: React.FormEvent,
    data: CommentEventPayload
  ) => {
    e.preventDefault();

    console.log("data: ", data);
    try {
      const res = await dispatch(addComment(data)).unwrap();

      if (res.success) {
        const dataEventPayload: CommentEventPayload = {
          ...data,
          data: res.commentData!,
        };
        console.log(dataEventPayload);
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
  };

  return (
    <ModalContext.Provider value={modalContextValue}>
      {children}
    </ModalContext.Provider>
  );
};
