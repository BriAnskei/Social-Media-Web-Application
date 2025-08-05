import "./MessageBox.css";

import { MutableRefObject, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import {
  ChatWindowType,
  closeWindow,
  toggleMinimize,
  viewProfile,
} from "../../../Components/Modal/globalSlice";
import Spinner from "../../../Components/Spinner/Spinner";
import { FetchedUserType } from "../../../types/user";

import {
  dropMessageOnClose,
  fetchMessagesByConvoId,
  sentMessage,
} from "./messengeSlice";
import { Message } from "../../../types/MessengerTypes";
import { userProfile } from "../../../utils/ImageUrlHelper";
import { useNavigate } from "react-router";
import { useUserById } from "../../../hooks/useUsers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { useChatSocket } from "../../../hooks/socket/useChatSocket";
import { useConversationById } from "../../../hooks/useConversation";
import { updateFollow } from "../../users/userSlice";
import { useMessagesByConversation } from "../../../hooks/useMessages";
import ChatArea from "./ChatArea";
import { useLoadMoreMessages } from "../../../hooks/chatBox/useLoadMoreMessages";
import {
  deleteConvoInUnRead,
  dropConversation,
} from "../Conversation/conversationSlice";
import {
  FollowPayloadToast,
  useToastEffect,
} from "../../../hooks/toast/useToastEffect";
import { useSocket } from "../../../hooks/socket/useSocket";

interface MessageBoxProp {
  ChatWindowData: ChatWindowType;
  currentUserData: FetchedUserType;
}

const MessageBox = ({ ChatWindowData, currentUserData }: MessageBoxProp) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { conversationId, minimized } = ChatWindowData;

  const { handleFollowEffect, handleDeleteEffect } = useToastEffect();
  const { emitFollow } = useSocket();
  const conversation = useConversationById(conversationId);
  const userParticipant = useUserById(ChatWindowData.participantId);
  const { messages, hasMore, loading } =
    useMessagesByConversation(conversationId);

  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [messageInput, setMessageInput] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const inputRef = useRef<any>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<any>(null);
  const lastScrollRef = useRef<number>(0);
  const lastMessageIndexRef = useRef<number>(0);

  const { emitConvoViewStatus } = useChatSocket();

  useEffect(() => {
    emitConvoViewStatus(true, conversation?._id!);
    async function fetchAllData() {
      await fetchMessages(conversationId, null);
    }

    fetchAllData();
  }, []);

  scrollHanlder(messages, lastMessageIndexRef, messagesRef, loading);

  setReadConvo(dispatch, ChatWindowData);

  const closeChat = () => {
    if (ChatWindowData.minimized) return;
    const conversationId = conversation._id;

    emitConvoViewStatus(false, conversation?._id!);
    dispatch(closeWindow(conversationId));
    dispatch(dropConversation(conversationId));
    dispatch(dropMessageOnClose(conversationId));
  };

  const handleDelete = async () => {
    try {
      await handleDeleteEffect(conversationId);
    } catch (error) {
      console.log("Failed to delete convo: ", error);
    }
  };

  const fetchMessages = async (
    conversationId: string,
    cursor: string | null
  ) => {
    try {
      const scrollElement = scrollRef.current;
      lastScrollRef.current = scrollElement?.scrollHeight;

      await dispatch(
        fetchMessagesByConvoId({ conversationId, cursor })
      ).unwrap();
    } catch (error) {
      console.error("Failed to fetch 'Message' data for chat window, ", error);
    }
  };

  const handleScroll = () => {
    const element = scrollRef.current;

    // Check if we're near the top (with a small buffer)
    if (element && element.scrollTop === 0 && !isFetchingMore && hasMore) {
      loadMoreMessages();
    }
  };

  const handleUpload = (e: any) => {
    const file = e.target?.files;

    if (file && file.length > 0) {
      const imageUrl = URL.createObjectURL(file[0]);
      setImageUrl(imageUrl);
      setImageFile(file[0]);
    }
  };

  const handleSubmitMessage = async (e: React.FormEvent<any>) => {
    try {
      e.preventDefault();
      if (loading || (!messageInput && !imageFile)) return;

      const messageDataPayload: Message = {
        sender: currentUserData._id,
        recipient: conversation?.participant._id!,
        content: messageInput,
        attachments: imageFile,
        conversationId: conversation?._id!,
        createdAt: new Date().toISOString(),
      };

      setMessageInput("");
      setImageUrl("");
      setImageFile(null);

      await dispatch(
        sentMessage({
          mesage: messageDataPayload,
          conversationId: conversation._id,
        })
      ).unwrap();
    } catch (error) {
      console.error("Failed to sent message, ", error);
    }
  };

  const handleFollow = async () => {
    try {
      const toastPayload: FollowPayloadToast = {
        followPayload: {
          userId: conversation.participant._id,
          followerId: currentUserData._id,
        },
        toastPayload: {
          isUnfollowing: false,
          userFullName: conversation.participant.fullName,
        },
      };

      await handleFollowEffect(toastPayload);

      dispatch(updateFollow(toastPayload.followPayload));

      const emitPayload = {
        userId: conversation.participant._id,
        followerId: currentUserData._id,
        followingName: currentUserData.fullName,
      };

      emitFollow(emitPayload);
    } catch (error) {
      console.log("Failed to handleFollow, ", error);
    }
  };

  const loadMoreMessages = useLoadMoreMessages({
    hasMore,
    messages,
    conversationId: conversation._id!,
    scrollRef,
    lastScrollRef,
    fetchMessages,
    setIsFetchingMore,
  });

  const viewUserProfile = () => {
    dispatch(viewProfile(userParticipant));
    navigate("/view/profile");
  };

  const isConversationNotReady = !conversation;
  const isMessagesNotReady = !messages;

  let isImageAttach = Boolean(imageUrl);

  return (
    <div
      className={`messenger-container ${
        isConversationNotReady ? "center-spinner" : ""
      } ${minimized ? "minimized" : ""}`}
      onClick={() =>
        !minimized ? undefined : dispatch(toggleMinimize({ conversationId }))
      }
    >
      {isConversationNotReady ? (
        <Spinner />
      ) : (
        <>
          <div className="chatwindow-header">
            <img
              src={userProfile(
                conversation.participant.profilePicture!,
                conversation.participant._id
              )}
              alt=""
              className="chatwindow-profile"
            />
            <div className="chatwindow-nm" onClick={viewUserProfile}>
              {conversation.participant.fullName}
            </div>
            <div className="chatwindow-icons">
              <span
                className="chatwindow-min"
                onClick={() => dispatch(toggleMinimize({ conversationId }))}
              >
                -
              </span>
              <span className="chatwindow-cls" onClick={closeChat}>
                x
              </span>
            </div>
          </div>
          <ChatArea
            hasMore={hasMore}
            isFetchingMore={isFetchingMore}
            isMessagesNotReady={isMessagesNotReady}
            messages={messages}
            handleScroll={handleScroll}
            scrollRef={scrollRef}
            conversationId={conversation._id}
            currentUserId={currentUserData._id}
            messagesRef={messagesRef}
          />

          {isImageAttach && (
            <div className="message-images-container">
              <div className="message-image">
                <img src={imageUrl} />
              </div>
              <span onClick={() => setImageUrl("")}>x</span>
            </div>
          )}

          {!conversation.isUserValidToRply ? (
            <div className="unreplyable-container">
              <div className="unreplyable-message">
                Unable to send message. Please follow this user first or delete
                the conversation otherwise.
              </div>
              <div className="unreplyable_buttons">
                <button onClick={handleFollow}>follow</button>
                <button onClick={handleDelete}>delete</button>
              </div>
            </div>
          ) : (
            <form
              className="input-area"
              onSubmit={(e) => handleSubmitMessage(e)}
            >
              <div>
                <label htmlFor="file-upload">
                  <FontAwesomeIcon
                    className="message-image-input"
                    icon={faImage}
                    type="file"
                  />
                </label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleUpload}
                  style={{ display: "none" }}
                />
              </div>

              <input
                ref={inputRef}
                type="text"
                placeholder="Message..."
                className="message-input"
                name="content"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                autoComplete="off"
              />
              <button className="sent-button" type="submit">
                ➤
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default MessageBox;
function setReadConvo(dispatch: AppDispatch, ChatWindowData: ChatWindowType) {
  useEffect(() => {
    dispatch(deleteConvoInUnRead(ChatWindowData.conversationId));
  }, [ChatWindowData.conversationId]);
}

function scrollHanlder(
  messages: Message[],
  lastMessageIndexRef: MutableRefObject<number>,
  messagesRef: MutableRefObject<HTMLDivElement | null>,
  loading: boolean
) {
  useEffect(() => {
    if (!messages) return;
    const prevIndex = lastMessageIndexRef.current;
    const currIndex = messages.length;

    function setViewportToBottom() {
      if (prevIndex === 0 && messages.length === 7) {
        messagesRef.current?.scrollIntoView({
          behavior: "instant",
          block: "end",
        });
      }
    }

    function smoothScroll() {
      if (messagesRef && currIndex === prevIndex + 1) {
        messagesRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }

    lastMessageIndexRef.current = messages.length;

    smoothScroll();
    setViewportToBottom();
  }, [messages, loading]);
}
