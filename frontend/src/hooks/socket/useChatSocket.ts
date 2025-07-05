import { Socket } from "socket.io-client";
import { AppDispatch } from "../../store/store";
import { ConversationType, Message } from "../../types/MessengerTypes";
import { addMessage } from "../../features/messenger/Message/messengeSlice";
import {
  increamentUnread,
  setLatestMessage,
  setReadConvoMessages,
} from "../../features/messenger/Conversation/conversationSlice";
import { useContext, useRef, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { SocketContext } from "../../context/SocketContext";

const CHAT_EVENTS = {
  open_conversation: "conversation_room-active",
  close_conversation: "conversation_room-inactive",
  message_on_sent: "message_on_sent",
  message_on_sent_closed: "message_on_sent_closedConvo",
  message_sent: "message-sent",
  conversation_on_view: "conversation_on_view",
};

interface ClosedConversationMessagePayload {
  conversation: ConversationType;
  messageData: Message;
}

interface ChatSocketSetupParams {
  socket: Socket;
  dispatch: AppDispatch;
  isConnected: boolean;
}

// Regular function that sets up chat socket events
export const setupChatSocket = ({
  socket,
  dispatch,
  isConnected,
}: ChatSocketSetupParams) => {
  if (!socket || !isConnected) {
    return null;
  }

  // Event handlers
  const handleIncomingMessage = (data: {
    conversation: ConversationType;
    messageData: Message;
  }) => {
    const { conversation, messageData } = data;

    dispatch(
      addMessage({
        conversationId: conversation._id,
        messageData: messageData,
      })
    );

    dispatch(
      setLatestMessage({
        conversation,
        messageData,
        updatedAt: messageData.createdAt,
      })
    );
  };

  const handleClosedConversationMessage = (
    data: ClosedConversationMessagePayload
  ) => {
    dispatch(
      setLatestMessage({
        conversation: data.conversation,
        messageData: data.messageData,
        updatedAt: data.messageData.createdAt,
      })
    );

    dispatch(increamentUnread(data.conversation._id));
  };

  const handleConvoOnview = (payload: {
    conversationId: string;
    openedAt: string;
  }) => {
    const { conversationId, openedAt } = payload;
    console.log("CONVOONVIEW", payload);

    dispatch(setReadConvoMessages(conversationId));
  };

  // Setup event listeners
  const setupEventListeners = () => {
    // Clean up any existing listeners first
    socket.off(CHAT_EVENTS.message_on_sent);
    socket.off(CHAT_EVENTS.message_on_sent_closed);
    socket.off(CHAT_EVENTS.conversation_on_view);

    socket.onAny((e, ...args) => {
      console.log(`Received in chat handler event: ${e}`, args);
    });

    // Add new listeners
    socket.on(CHAT_EVENTS.message_on_sent, handleIncomingMessage);
    socket.on(
      CHAT_EVENTS.message_on_sent_closed,
      (data: ClosedConversationMessagePayload) => {
        handleClosedConversationMessage(data);
      }
    );
    socket.on(CHAT_EVENTS.conversation_on_view, handleConvoOnview);
  };

  // Cleanup function
  const cleanup = () => {
    socket.off(CHAT_EVENTS.message_on_sent, handleIncomingMessage);
    socket.off(
      CHAT_EVENTS.message_on_sent_closed,
      handleClosedConversationMessage
    );
    socket.off(CHAT_EVENTS.conversation_on_view, handleConvoOnview);
  };

  // Emit function
  const emitConvoViewStatus = (
    isUserActive: boolean,
    conversationId: string
  ) => {
    if (!socket) {
      throw new Error("Failed emitConvoViewStatus: Socket is not initialized");
    }

    const eventType = isUserActive
      ? CHAT_EVENTS.open_conversation
      : CHAT_EVENTS.close_conversation;

    socket.emit(eventType, conversationId);
  };

  // Setup the listeners
  setupEventListeners();

  // Return cleanup and emit functions
  return {
    cleanup,
    emitConvoViewStatus,
  };
};

// Hook version that uses the setup function
export const useChatSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { socket, isConnected } = useContext(SocketContext);
  const chatSocketRef = useRef<{
    cleanup: () => void;
    emitConvoViewStatus: (
      isUserActive: boolean,
      conversationId: string
    ) => void;
  } | null>(null);

  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    // Setup chat socket
    const chatSocket = setupChatSocket({ socket, dispatch, isConnected });
    chatSocketRef.current = chatSocket;

    // Cleanup on unmount
    return () => {
      if (chatSocketRef.current) {
        chatSocketRef.current.cleanup();
        chatSocketRef.current = null;
      }
    };
  }, [socket, isConnected, dispatch]);

  const emitConvoViewStatus = useCallback(
    (isUserActive: boolean, conversationId: string) => {
      if (chatSocketRef.current) {
        chatSocketRef.current.emitConvoViewStatus(isUserActive, conversationId);
      }
    },
    []
  );

  return {
    socket,
    emitConvoViewStatus,
  };
};
