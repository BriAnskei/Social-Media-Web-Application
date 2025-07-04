import React, { createContext, ReactNode, useState } from "react";
import { PopoverDeleteConvoType } from "../Components/Popover/PopOverType";

interface PopoverProp {
  show: boolean;
  target: React.MutableRefObject<null> | null;
  postId: string;
  popOverToggle: (postId: string, target: React.MutableRefObject<null>) => void;
  popOverClose: () => void;
}

interface toggleChatPayload {
  ref: React.MutableRefObject<null>;
  convoId: string;
}

interface ChatProp {
  show: boolean;
  ref: React.MutableRefObject<null>;
  convoId: string;
  deleteConvoToggle: (data: toggleChatPayload) => void;
}

export interface PopoverContextValue {
  popover: PopoverProp;
  chatProp: ChatProp;
}

interface ModalProviderProps {
  children: ReactNode;
}

export const PopoverContext = createContext<PopoverContextValue | undefined>(
  undefined
);

export const PopoverRefProvider: React.FC<ModalProviderProps> = ({
  children,
}) => {
  const [popoverData, setPopoverData] = useState<{
    show: boolean;
    postId: string;
    target: React.MutableRefObject<null> | any;
  }>({
    show: false,
    postId: "",
    target: null,
  });

  const [chatPopover, setChatPopover] = useState<PopoverDeleteConvoType>({
    show: false,
    target: null,
    convoId: "",
  });

  // Popover events
  const popOverToggle = (
    postId: string,
    target: React.MutableRefObject<null>
  ) => {
    if (target.current && popoverData.show) {
      if (target.current !== popoverData.target.current) {
        setPopoverData((prev) => ({ ...prev, target: target, postId }));
      } else {
        setPopoverData((prev) => ({ ...prev, show: !prev.show, postId: "" }));
      }
    } else {
      setPopoverData((prev) => ({
        ...prev,
        target: target,
        show: !prev.show,
        postId,
      }));
    }
  };

  const popOverClose = () => {
    const empyPayload = {} as PopoverProp;
    setPopoverData(() => ({ ...empyPayload, show: false }));
  };

  const deleteConvoToggle = (payload: toggleChatPayload) => {
    try {
      const { ref, convoId } = payload;

      if (chatPopover.target && chatPopover.target.current) {
        if (chatPopover.target.current !== ref.current) {
          setChatPopover((prev) => ({ ...prev, target: ref, convoId }));
        } else {
          closeConvoPopover();
        }
      } else {
        initializeConvoPopoverRef(payload);
      }
    } catch (error) {
      console.error("Failed to toggle delete convo popover, ", error);
    }
  };

  const closeConvoPopover = () => {
    setTimeout(() => {
      setChatPopover((prev) => ({
        ...prev,
        target: null,
        show: false,
        convoId: "",
      }));
    }, 200);
  };

  const initializeConvoPopoverRef = (payload: toggleChatPayload) => {
    try {
      const { ref, convoId } = payload;

      setChatPopover({ target: ref, show: true, convoId });
    } catch (error) {
      throw new Error((error as Error).message);
    }
  };

  const popoverContextValue: PopoverContextValue = {
    popover: {
      show: popoverData.show,
      target: popoverData.target,
      postId: popoverData.postId,
      popOverToggle,
      popOverClose,
    },
    chatProp: {
      convoId: chatPopover.convoId,
      show: chatPopover.show,
      ref: chatPopover.target,
      deleteConvoToggle,
    },
  };

  return (
    <PopoverContext.Provider value={popoverContextValue}>
      {children}
    </PopoverContext.Provider>
  );
};
