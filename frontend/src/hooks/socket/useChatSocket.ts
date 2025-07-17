import { Socket } from "socket.io-client";
import { AppDispatch } from "../../store/store";
import { ConversationType, Message } from "../../types/MessengerTypes";
import { addMessage } from "../../features/messenger/Message/messengeSlice";
import {
  findOneConvoUpdate,
  setLastMessageReadByParticipant,
  setLatestMessage,
  setReadConvoMessages,
} from "../../features/messenger/Conversation/conversationSlice";
import { useContext, useRef, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { SocketContext } from "../../context/SocketContext";
import { FetchedUserType } from "../../types/user";
import { useCurrentUser } from "../useUsers";

const CHAT_EVENTS = {
  open_conversation: "conversation_room-active",
  close_conversation: "conversation_room-inactive",
  message_on_sent: "message_on_sent",
  message_on_sent_closed: "message_on_sent_closedConvo",
  message_sent: "message-sent",
  conversation_on_view: "conversation_on_view",
};

export interface ClosedConversationMessagePayload {
  conversation: ConversationType;
  messageData: Message;
}

interface ChatSocketSetupParams {
  socket: Socket;
  dispatch: AppDispatch;
  isConnected: boolean;
  currUser: FetchedUserType;
}

// Regular function that sets up chat socket events
export const setupChatSocket = ({
  socket,
  dispatch,
  isConnected,
  currUser,
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
    const { _id: currUserId } = currUser;

    console.log("Message On room global send: ", data);

    // add message in the conversation messages
    dispatch(
      addMessage({
        conversationId: conversation._id,
        messageData: messageData,
      })
    );

    // set the latest message of that conversation
    dispatch(
      setLatestMessage({
        conversation,
        messageData,
        updatedAt: messageData.createdAt,
      })
    );

    // if this message is read by the recipent we will set messageData._id as the messageOnReadId
    if (messageData.read && messageData.sender === currUserId) {
      dispatch(
        setReadConvoMessages({
          convoId: conversation._id,
          messageOnReadId: messageData._id,
        })
      );
    }
  };

  const handleClosedConversationMessage = (
    data: ClosedConversationMessagePayload
  ) => {
    dispatch(findOneConvoUpdate(data));
  };

  const handleConvoOnview = (payload: { convoId: string; userId: string }) => {
    const { convoId, userId } = payload;

    dispatch(setLastMessageReadByParticipant({ userId, convoId }));
  };

  // Setup event listeners
  const setupEventListeners = () => {
    // Clean up any existing listeners first
    socket.off(CHAT_EVENTS.message_on_sent);
    socket.off(CHAT_EVENTS.message_on_sent_closed);
    socket.off(CHAT_EVENTS.conversation_on_view);

    // socket.onAny((e, ...args) => {
    //   console.log(`Received in chat handler event: ${e}`, args);
    // });

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

export const useChatSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useCurrentUser();
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
    const chatSocket = setupChatSocket({
      socket,
      dispatch,
      isConnected,
      currUser: currentUser,
    });
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
