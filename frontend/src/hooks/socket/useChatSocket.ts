import { useCallback, useContext, useEffect, useRef } from "react";
import { SocketContext } from "../../context/SocketContext";
import { ConversationType, Message } from "../../types/MessengerTypes";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { addMessage } from "../../features/messenger/Message/messengeSlice";
import {
  increamentUnread,
  setLatestMessage,
} from "../../features/messenger/Conversation/conversationSlice";

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

  const handleIncomingMessage = useCallback(
    (data: { conversation: ConversationType; messageData: Message }) => {
      const { conversation, messageData } = data;
      dispatch(
        addMessage({
          conversationId: data.conversation._id,
          messageData: data.messageData,
        })
      );
      dispatch(
        setLatestMessage({
          conversation,
          messageData,
          updatedAt: messageData.createdAt,
        })
      );
    },
    [socket, isConnected]
  );

  interface ClosedConversationMessagePayload {
    conversation: ConversationType;
    messageData: Message;
  }

  const handleClosedConversationMessage = useCallback(
    (data: ClosedConversationMessagePayload) => {
      dispatch(
        setLatestMessage({
          conversation: data.conversation,
          messageData: data.messageData,
          updatedAt: data.messageData.createdAt,
        })
      );

      dispatch(increamentUnread(data.conversation._id));
    },
    [dispatch]
  );

  useEffect(() => {
    if (!socket || !isConnected || eventInitialize.current) {
      return;
    }

    const removeAllPrevListeners = () => {
      socket.off(CHAT_EVENTS.message_on_sent);
      socket.off("message_on_sent_closedConvo");
    };

    const listeOnAnyEvents = () => {
      // Register event listeners
      socket.on(CHAT_EVENTS.message_on_sent, handleIncomingMessage);
      socket.on("message_on_sent_closedConvo", handleClosedConversationMessage);
    };

    removeAllPrevListeners();
    listeOnAnyEvents();

    eventInitialize.current = true;

    return () => {
      if (socket) {
        removeAllPrevListeners();
        eventInitialize.current = false;
      }
    };
  }, [socket, isConnected, dispatch]); // Added isConnected as dependency

  const emitConvoViewStatus = useCallback(
    (isUserActive: Boolean, conversationId: string) => {
      if (!socket) {
        throw new Error("Failed emitConvoViewStatus: Socket is not initialize");
      }

      const eventType = isUserActive
        ? CHAT_EVENTS.open_conversation
        : CHAT_EVENTS.close_conversation;

      socket.emit(eventType, conversationId);
    },
    [socket]
  );

  return {
    socket,
    emitConvoViewStatus,
  };
};
