import React, { createContext, ReactNode, useRef, useState } from "react";

interface PopoverProp {
  show: boolean;
  target: React.MutableRefObject<null>;
  postId: string;
  popOverToggle: (postId: string, target: React.MutableRefObject<null>) => void;
  popOverClose: () => void;
}

interface ChatProp {
  show: boolean;
  ref: React.MutableRefObject<null>;
  toogleChat: (ref: React.MutableRefObject<null>) => void;
}

interface GlobalContextValue {
  popover: PopoverProp;
  chatProp: ChatProp;
}

interface ModalProviderProps {
  children: ReactNode;
}

export const GlobalContext = createContext<GlobalContextValue | undefined>(
  undefined
);

export const GlobalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [popoverData, setPopoverData] = useState<{
    show: boolean;
    postId: string;
    target: React.MutableRefObject<null> | any;
  }>({
    show: false,
    postId: "",
    target: null,
  });

  const [chatPopover, setChatPopover] = useState<{
    show: boolean;
    ref: React.MutableRefObject<null> | any;
  }>({
    show: false,
    ref: null,
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
    setPopoverData((prev) => ({ ...prev, show: false }));
  };

  // chats
  const toogleChat = (ref: React.MutableRefObject<null>) => {
    if (!ref || !ref.current) {
      throw new Error("no reference to open chat list");
    }

    if (chatPopover.ref && chatPopover.ref.current) {
      setChatPopover((prev) => ({ ...prev, ref: null, show: false }));
    } else {
      setChatPopover((prev) => ({ ...prev, ref: ref, show: true }));
    }
  };

  const globalContextValue: GlobalContextValue = {
    popover: {
      show: popoverData.show,
      target: popoverData.target,
      postId: popoverData.postId,
      popOverToggle,
      popOverClose,
    },
    chatProp: {
      show: chatPopover.show,
      ref: chatPopover.ref,
      toogleChat,
    },
  };

  return (
    <GlobalContext.Provider value={globalContextValue}>
      {children}
    </GlobalContext.Provider>
  );
};
