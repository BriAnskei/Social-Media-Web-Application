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
import { FetchedUserType } from "../../../types/user";
import { monthNames } from "./monthNames";
import {
  openConversation,
  setLatestMessage,
} from "../Conversation/conversationSlice";
import { fetchMessagesByConvoId, sentMessage } from "./messengeSlice";
import { ConversationType, Message } from "../../../types/MessengerTypes";
import { getMessageImageUrl, userProfile } from "../../../utils/ImageUrlHelper";
import { useNavigate } from "react-router";
import { useUserById } from "../../../hooks/useUsers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { useChatSocket } from "../../../hooks/socket/useChatSocket";

interface MessageBoxProp {
  ChatWindowData: ChatWindowType;
  currentUserData: FetchedUserType;
}

const MessageBox = ({ ChatWindowData, currentUserData }: MessageBoxProp) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { socket, toggleViewConversation } = useChatSocket();

  const userParticipant = useUserById(ChatWindowData.participantId);

  const { contactId, participantId, minimized } = ChatWindowData;

  const [conversation, setConversation] = useState<ConversationType | null>(
    null
  );
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isConversationLoading, setIsConversationLoading] = useState(false);
  const [isThereMoreMessages, setIsThereMoreMessages] = useState(true);

  const [messageInput, setMessageInput] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [sentMessageLoading, setSentMessageLoading] = useState(false);

  const inputRef = useRef<any>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<any>(null);
  const lastScrollRef = useRef<number>(0);
  const lastMessageIndexRef = useRef<number>(0);

  const closeChat = () => {
    if (ChatWindowData.minimized) return;
    toggleViewConversation(false, conversation?._id!);
    dispatch(closeWindow({ contactId }));
  };

  const fetchConversationData = async () => {
    try {
      setIsConversationLoading(true);
      const data = {
        otherUser: participantId,
        contactId,
      };
      const res = await dispatch(openConversation(data)).unwrap();

      const conversationData = res?.conversations as ConversationType;
      toggleViewConversation(!ChatWindowData.minimized, conversationData._id);

      setConversation(conversationData || null);

      await fetchMessages(conversationData._id, null);
    } catch (error) {
      console.error(
        "Failed to fetch 'Conversation' data  for chat window, ",
        error
      );
    } finally {
      setIsConversationLoading(false);
    }
  };

  const fetchMessages = async (
    conversationId: string,
    cursor: string | null
  ) => {
    try {
      const scrollElement = scrollRef.current;
      lastScrollRef.current = scrollElement?.scrollHeight;

      const responseData = await dispatch(
        fetchMessagesByConvoId({ conversationId, cursor })
      ).unwrap();

      const messagesData = responseData?.messages! as Message[];
      const isThereMore = responseData?.hasMore;

      if (!messagesData || isThereMore === undefined) {
        throw new Error(
          "Error in storing new messages, one of the prop data response might be undifined"
        );
      }

      setIsThereMoreMessages(Boolean(isThereMore));

      setMessages((prev) => [...(messagesData.reverse() || []), ...prev]);
    } catch (error) {
      console.error("Failed to fetch 'Message' data for chat window, ", error);
    } finally {
      setIsMessageLoading(false);
    }
  };

  useEffect(() => {
    async function fetchAllData() {
      await fetchConversationData();
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
      if (sentMessageLoading || messages.length > 7) {
        messagesRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
    smoothScroll();
    setViewportToBottom();
  }, [messages, sentMessageLoading]);

  useEffect(() => {
    console.log("Messages update", messages);
  }, [messages]);

  const loadMoreMessages = useCallback(async () => {
    if (!isThereMoreMessages) return;

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
  }, [isMessageLoading, isThereMoreMessages, messages]);

  const handleScroll = () => {
    const element = scrollRef.current;
    // Check if we're near the top (with a small buffer)
    if (element.scrollTop === 0 && !isFetchingMore && isThereMoreMessages) {
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
      if (sentMessageLoading || (!messageInput && !imageFile)) return;
      setSentMessageLoading(true);

      const newDate = new Date();

      const messageDataPayload: Message = {
        sender: currentUserData._id,
        recipient: conversation?.participant._id!,
        content: messageInput,
        attachments: imageFile ? "loading" : null,
        conversationId: conversation?._id!,
        createdAt: newDate.toISOString(),
      };

      console.log("Message data to send in the slice");

      setMessageInput("");
      setImageUrl("");

      lastMessageIndexRef.current = messages.length - 1;
      setMessages((prev) => [...prev, messageDataPayload]);
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
    } finally {
      setSentMessageLoading(false);
    }
  };

  const viewUserProfile = () => {
    dispatch(viewProfile(userParticipant));
    navigate("/view/profile");
  };

  const isConversationNotReady = isConversationLoading || !conversation;
  const isMessagesNotReady = isMessageLoading || !messages;

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
            {!isThereMoreMessages && (
              <div className="no-message-left">
                <span>No older messages</span>
              </div>
            )}

            {/* Fetching loading flag */}
            {isFetchingMore && isThereMoreMessages && (
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
                <button>follow</button>
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
