import { useCallback, useContext, useEffect, useRef } from "react";
import { SocketContext } from "../../context/SocketContext";

const CHAT_EVENTS = {
  open_conversation: "conversation_room-active",
  close_conversation: "conversation_room-inactive",
};

export const useChatSocket = () => {
  const { socket, isConnected } = useContext(SocketContext);

  const eventInitialize = useRef(false);

  const toggleViewConversation = useCallback(
    (isUserActive: Boolean, conversationId: string) => {
      if (!socket) {
        throw new Error(
          "Failed to emit active convo, socket is not initialize"
        );
      }

      const eventType = isUserActive
        ? CHAT_EVENTS.open_conversation
        : CHAT_EVENTS.close_conversation;

      console.log(
        "Function toggled, emitting ",
        isUserActive,
        conversationId,
        "to ",
        eventType
      );

      socket.emit(eventType, conversationId);
    },
    [socket]
  );

  useEffect(() => {
    if (!socket || !eventInitialize.current) {
      return;
    }

    const eventHanlders = {};
  }, [socket]);

  return {
    socket,
    toggleViewConversation,
  };
};
