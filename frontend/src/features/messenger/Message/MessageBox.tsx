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
import { useConversationByContactId } from "../Conversation/useConvo";
import { getMessageImageUrl, userProfile } from "../../../utils/ImageUrlHelper";
import { useNavigate } from "react-router";

interface MessageBoxProp {
  ChatWindowData: ChatWindowType;
  currentUserData: FetchedUserType;
}

const MessageBox = ({ ChatWindowData, currentUserData }: MessageBoxProp) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { contactId, participantId, minimized } = ChatWindowData;

  const [conversation, setConversation] = useState<ConversationType | null>(
    null
  );
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isConversationLoading, setIsConversationLoading] = useState(false);
  const [isThereMoreMessages, setIsThereMoreMessages] = useState(true);

  const [messageInput, setMessageInput] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [sentMessageLoading, setSentMessageLoading] = useState(false);

  const inputRef = useRef<any>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<any>(null);
  const lastScrollRef = useRef<number>(0);

  const closeChat = () => {
    if (ChatWindowData.minimized) return;

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

      const messagesData = responseData?.messages!;
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
      if (!isFetchingMore && messages.length === 7) {
        messagesRef.current?.scrollIntoView({
          behavior: "instant",
          block: "end",
        });
      }
    }

    function smoothScroll() {
      if (!isFetchingMore && messages.length > 7) {
        messagesRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
    smoothScroll();
    setViewportToBottom();
  }, [messages]);

  const loadMoreMessages = useCallback(async () => {
    if (!isThereMoreMessages) return;

    setIsFetchingMore(true);

    const scrollElement = scrollRef.current;
    lastScrollRef.current = scrollElement.scrollHeight;

    const lastMessageDateAsCursor = messages[0].createdAt;

    await fetchMessages(conversation?._id!, lastMessageDateAsCursor);

    // use setTimeout to ensure scroll adjustment runs after rect has updated the DOM with the new messages
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

  const handleSubmitMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      if (sentMessageLoading) return;
      setSentMessageLoading(true);

      const createdAt = new Date();

      const messageDataPayload: Message = {
        sender: currentUserData._id,
        recipient: conversation?.participant._id!,
        content: messageInput,
        conversationId: conversation?._id!,
        createdAt: createdAt.toISOString(),
      };

      setMessageInput("");

      setMessages((prev) => [...prev, messageDataPayload]);

      dispatch(
        setLatestMessage({
          conversationId: conversation?._id!,
          messageData: messageDataPayload,
          updatedAt: messageDataPayload.createdAt,
        })
      );
      await dispatch(sentMessage(messageDataPayload));
    } catch (error) {
      console.error("Failed to sent message, ", error);
    } finally {
      setSentMessageLoading(false);
    }
  };

  const viewUserProfile = (userId: string) => {
    if (userId === currentUserData._id) {
      navigate("/profile");
    } else {
      dispatch(viewProfile(data));
      navigate("/view/profile");
    }
  };

  const isConversationNotReady = isConversationLoading || !conversation;
  const isMessagesNotReady = isMessageLoading || !messages;

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
            <div className="chatwindow-nm">
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
                    {msg.attachments && (
                      <div
                        className={`chat-window-img ${
                          isMessageOwner ? "img-sent" : "img-recieved"
                        }`}
                        onClick={() =>
                          dispatch(
                            toggleViewMessageImage(
                              getMessageImageUrl(
                                msg.attachments!,
                                msg.sender,
                                conversation._id
                              )
                            )
                          )
                        }
                      >
                        <img
                          src={getMessageImageUrl(
                            msg.attachments!,
                            msg.sender,
                            conversation._id
                          )}
                          alt=""
                        />
                      </div>
                    )}
                    <div
                      key={msg._id}
                      className={`message ${
                        isMessageOwner ? "sent" : "recieved"
                      }`}
                    >
                      {msg.content}
                      <div className="time">
                        {date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
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
          <form className="input-area" onSubmit={(e) => handleSubmitMessage(e)}>
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
        </>
      )}
    </div>
  );
};

export default MessageBox;
