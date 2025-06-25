import { useCallback, useContext, useEffect, useRef } from "react";
import { SocketContext } from "../../context/SocketContext";
import { Message } from "../../types/MessengerTypes";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { addMessage } from "../../features/messenger/Message/messengeSlice";

const CHAT_EVENTS = {
  open_conversation: "conversation_room-active",
  close_conversation: "conversation_room-inactive",
  message_on_sent: "message_on_sent",
  message_sent: "message-sent",
};

export const useChatSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
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

      socket.emit(eventType, conversationId);
    },
    [socket]
  );

  const onSentMessage = useCallback(
    (conversationId: string, messageData: Message) => {
      console.log("Sending data");
      if (!socket) {
        throw new Error(
          "Failed to emit active convo, socket is not initialize"
        );
      }

      socket.emit(CHAT_EVENTS.message_sent, { conversationId, messageData });
    },
    [socket]
  );

  useEffect(() => {
    if (!socket || eventInitialize.current) {
      return;
    }

    const removeAllListener = () => {
      socket.off(CHAT_EVENTS.message_on_sent);
    };

    removeAllListener();

    const eventHanlders = {
      messageOnSent: (data: {
        conversationId: string;
        messageData: Message;
      }) => {
        dispatch(addMessage(data));
      },
    };

    socket.on(CHAT_EVENTS.message_on_sent, eventHanlders.messageOnSent);

    eventInitialize.current = true;

    return () => {
      if (socket) {
        socket.off(CHAT_EVENTS.message_on_sent, eventHanlders.messageOnSent);

        eventInitialize.current = false;
      }
    };
  }, [socket]);

  return {
    socket,
    toggleViewConversation,
    onSentMessage,
  };
};
