import { useCallback, useContext, useEffect, useRef } from "react";
import { SocketContext } from "../../context/SocketContext";
import { Message } from "../../types/MessengerTypes";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { addMessage } from "../../features/messenger/Message/messengeSlice";
import { setLatestMessage } from "../../features/messenger/Conversation/conversationSlice";

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
    (data: { conversationId: string; messageData: Message }) => {
      const { conversationId, messageData } = data;

      dispatch(addMessage(data));
      dispatch(
        setLatestMessage({
          conversationId,
          messageData,
          updatedAt: messageData.createdAt,
        })
      );
    },
    [socket, isConnected]
  );

  interface ClosedConversationMessagePayload {
    conversationId: string;
    messageData: Message;
  }

  const handleClosedConversationMessage = useCallback(
    (data: ClosedConversationMessagePayload) => {
      console.log("🎯 CLOSED CONVO EVENT RECEIVED!", data);
      dispatch(
        setLatestMessage({
          conversationId: data.conversationId,
          messageData: data.messageData,
          updatedAt: data.messageData.createdAt,
        })
      );
    },
    [dispatch]
  );

  const registerUnviewChatEvents = useCallback(() => {
    if (!socket || !isConnected) return;
    console.log("Early register for close convo events");

    socket.on("message_on_sent_closedConvo", handleClosedConversationMessage);
  }, [socket, isConnected]);

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log("Socket not ready:", { socket: !!socket, isConnected });
      return;
    }

    if (eventInitialize.current) {
      return;
    }

    const removeAllPrevListeners = () => {
      socket.off(CHAT_EVENTS.message_on_sent);
      socket.off("message_on_sent_closedConvo");
    };

    removeAllPrevListeners();

    // Register event listeners
    socket.on(CHAT_EVENTS.message_on_sent, handleIncomingMessage);

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
    registerUnviewChatEvents,
  };
};
