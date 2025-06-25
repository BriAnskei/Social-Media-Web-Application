import "./MessageBox.css";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import {
  ChatWindowType,
  closeWindow,
  toggleMinimize,
  toggleViewMessageImage,
  viewProfile,
} from "../../../Components/Modal/globalSlice";
import Spinner, { MessageSpinner } from "../../../Components/Spinner/Spinner";
import { FetchedUserType, FollowPayload } from "../../../types/user";
import { monthNames } from "../../../assets/monthNames";
import {
  setConvoToValid,
  setLatestMessage,
} from "../Conversation/conversationSlice";
import { fetchMessagesByConvoId, sentMessage } from "./messengeSlice";
import { Message } from "../../../types/MessengerTypes";
import { getMessageImageUrl, userProfile } from "../../../utils/ImageUrlHelper";
import { data, useNavigate } from "react-router";
import { useUserById } from "../../../hooks/useUsers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { useChatSocket } from "../../../hooks/socket/useChatSocket";
import { useConversationById } from "../../../hooks/useConversation";
import { followToggled } from "../../users/userSlice";
import { useMessagesByConversation } from "../../../hooks/useMessages";

interface MessageBoxProp {
  ChatWindowData: ChatWindowType;
  currentUserData: FetchedUserType;
}

const MessageBox = ({ ChatWindowData, currentUserData }: MessageBoxProp) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { conversationId, participantId, minimized } = ChatWindowData;

  const conversation = useConversationById(conversationId);
  const userParticipant = useUserById(ChatWindowData.participantId);
  const { messages, hasMore, loading } =
    useMessagesByConversation(conversationId);

  const { contactId } = conversation;

  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [messageInput, setMessageInput] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const inputRef = useRef<any>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<any>(null);
  const lastScrollRef = useRef<number>(0);
  const lastMessageIndexRef = useRef<number>(0);

  const { socket, toggleViewConversation } = useChatSocket();

  const closeChat = () => {
    if (ChatWindowData.minimized) return;
    const conversationId = conversation._id;

    toggleViewConversation(false, conversation?._id!);
    dispatch(closeWindow({ conversationId }));
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

  useEffect(() => {
    console.log("conversaiton update: ", conversation);

    console.log("mesages update: ", messageInput, loading);
  }, [loading, messages]);

  useEffect(() => {
    toggleViewConversation(true, conversation?._id!);
    async function fetchAllData() {
      await fetchMessages(conversationId, null);
    }

    fetchAllData();
  }, []);

  useEffect(() => {
    function setViewportToBottom() {
      if (!isFetchingMore && messages.length <= 7) {
        messagesRef.current?.scrollIntoView({
          behavior: "instant",
          block: "end",
        });
      }
    }

    function smoothScroll() {
      if (loading || messages.length > 7) {
        messagesRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
    smoothScroll();
    setViewportToBottom();
  }, [messages, loading]);

  const handleScroll = () => {
    const element = scrollRef.current;
    // Check if we're near the top (with a small buffer)
    if (element.scrollTop === 0 && !isFetchingMore && hasMore) {
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

      const newDate = new Date();

      const messageDataPayload: Message = {
        sender: currentUserData._id,
        recipient: conversation?.participant._id!,
        content: messageInput,
        attachments: imageFile ? "loading" : null,
        conversationId: conversation?._id!,
        createdAt: newDate.toISOString(),
      };

      setMessageInput("");
      setImageUrl("");

      lastMessageIndexRef.current = messages.length - 1;

      dispatch(
        setLatestMessage({
          conversationId: conversation?._id!,
          messageData: messageDataPayload,
          updatedAt: messageDataPayload.createdAt,
        })
      );

      await dispatch(
        sentMessage({ ...messageDataPayload, attachments: imageFile })
      ).unwrap();
    } catch (error) {
      console.error("Failed to sent message, ", error);
    }
  };

  const handleFollow = async () => {
    try {
      const convoId = conversation._id;
      const followPayload: FollowPayload = {
        userId: conversation.participant._id,
        followerId: currentUserData._id,
      };

      console.log("Conversation Id", convoId);

      dispatch(setConvoToValid(convoId));

      await dispatch(followToggled(followPayload));
    } catch (error) {
      console.log("Failed to handleFollow, ", error);
    }
  };

  const loadMoreMessages = useCallback(async () => {
    if (!hasMore) return;

    setIsFetchingMore(true);

    const scrollElement = scrollRef.current;
    lastScrollRef.current = scrollElement.scrollHeight;

    const lastMessageDateAsCursor = messages[0].createdAt;

    await fetchMessages(conversation?._id!, lastMessageDateAsCursor);

    // use setTimeout to ensure scroll adjustment runs after component rendered and  has updated the DOM with the new messages
    setTimeout(() => {
      const newScrollHeight = scrollElement.scrollHeight;
      const scrollDiff = newScrollHeight - lastScrollRef.current;

      scrollElement.scrollTop = scrollDiff;

      setIsFetchingMore(false);
    }, 0);
  }, [hasMore, hasMore, messages]);

  const viewUserProfile = () => {
    dispatch(viewProfile(userParticipant));
    navigate("/view/profile");
  };

  const isConversationNotReady = !conversation;
  const isMessagesNotReady = loading || !messages;

  let isImageAttach = Boolean(imageUrl);

  return (
    <div
      className={`messenger-container ${
        isConversationNotReady ? "center-spinner" : ""
      } ${minimized ? "minimized" : ""}`}
      onClick={() =>
        !minimized ? undefined : dispatch(toggleMinimize({ contactId }))
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
                onClick={() => dispatch(toggleMinimize({ contactId }))}
              >
                -
              </span>
              <span className="chatwindow-cls" onClick={closeChat}>
                x
              </span>
            </div>
          </div>
          <div className="chat-area" ref={scrollRef} onScroll={handleScroll}>
            {/* No Conversation to fetch */}
            {!hasMore && (
              <div className="no-message-left">
                <span>No older messages</span>
              </div>
            )}

            {/* Fetching loading flag */}
            {isFetchingMore && hasMore && (
              <div className="message-loading">
                Loading.... <MessageSpinner />
              </div>
            )}

            {isMessagesNotReady ? (
              <Spinner />
            ) : (
              messages.map((msg, index) => {
                const isoString = msg.createdAt;
                const date = new Date(isoString);

                const nextMsg = messages![index + 1];
                let nxtMsgDate;
                if (nextMsg) {
                  const isoString = nextMsg.createdAt;
                  nxtMsgDate = new Date(isoString);
                }

                const isMessageOwner = msg.sender === currentUserData._id;

                const isMessageDiffDate =
                  nxtMsgDate &&
                  date.toDateString() !== nxtMsgDate.toDateString();

                return (
                  <div key={index} className="message-containter">
                    {/* Message image attachment */}
                    {msg.attachments && (
                      <div
                        className={`chat-window-img ${
                          isMessageOwner ? "img-sent" : "img-recieved"
                        }`}
                        onClick={() =>
                          dispatch(
                            toggleViewMessageImage(
                              getMessageImageUrl(
                                msg.attachments! as string,
                                msg.sender,
                                conversation._id
                              )
                            )
                          )
                        }
                      >
                        <img
                          src={getMessageImageUrl(
                            msg.attachments! as string,
                            msg.sender,
                            conversation._id
                          )}
                          alt=""
                        />
                      </div>
                    )}
                    {/* message content */}
                    {msg.content && (
                      <div
                        key={msg._id}
                        className={`message ${
                          isMessageOwner ? "sent" : "recieved"
                        }`}
                      >
                        {msg.content}
                      </div>
                    )}

                    <div
                      className={`time ${
                        isMessageOwner ? "img-sent" : "img-recieved"
                      }`}
                    >
                      {date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {isMessageDiffDate && (
                      <div className="message-date">
                        {monthNames[date.getMonth()]}
                        {"  " + date.getDate() + " " + date.getFullYear()}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesRef}></div>
          </div>

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
                <button>delete</button>
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
