import "./MessageBox.css";

import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import {
  ChatWindowType,
  closeWindow,
  toggleMinimize,
  toggleViewMessageImage,
} from "../../../Components/Modal/globalSlice";
import Spinner from "../../../Components/Spinner/Spinner";
import { FetchedUserType } from "../../../types/user";
import { monthNames } from "./monthNames";
import {
  openConversation,
  setLatestMessage,
} from "../Conversation/conversationSlice";
import { fetchMessagesByConvoId, sentMessage } from "./messengeSlice";
import { ConversationType, Message } from "../../../types/MessengerTypes";
import { useConversationByContactId } from "../Conversation/useConvo";
import { userProfile } from "../../../utils/ImageUrlHelper";

interface MessageBoxProp {
  ChatWindowData: ChatWindowType;
  currentUserData: FetchedUserType;
}

const MessageBox = ({ ChatWindowData, currentUserData }: MessageBoxProp) => {
  const dispatch = useDispatch<AppDispatch>();
  const { contactId, participantId, minimized } = ChatWindowData;
  const conversationData = useConversationByContactId(contactId);

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

      setConversation((res?.conversations as ConversationType) || null);

      const conversation = res?.conversations as ConversationType;

      await fetchMessages(conversation._id, null);
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
    cursor: string | null,
    scrollHeightBefore?: number
  ) => {
    try {
      if (isFetchingMore) {
        setIsMessageLoading(true);
      }
      const responseData = await dispatch(
        fetchMessagesByConvoId({ conversationId, cursor })
      ).unwrap();

      const newMessages = responseData?.messages!;

      setIsThereMoreMessages(responseData?.hasMore!);
      setMessages((prev) => [...(newMessages.reverse() || []), ...prev]);

      // After state update, adjust scroll position
      if (scrollHeightBefore && scrollRef.current) {
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            const scrollHeightAfter = scrollRef.current.scrollHeight;
            scrollRef.current.scrollTop =
              scrollHeightAfter - scrollHeightBefore - 1;
          }
        });
      }
    } catch (error) {
      console.error("Failed to fetch 'Message' data for chat window, ", error);
    } finally {
      setIsMessageLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    async function fetchAllData() {
      await fetchConversationData();
    }

    fetchAllData();
  }, []);

  useEffect(() => {
    if (isFetchingMore) return;

    if (sentMessageLoading) {
      messagesRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else {
      messagesRef.current?.scrollIntoView({
        behavior: "instant",
        block: "end",
      });
    }
  }, [messages]);

  useEffect(() => {
    function setConversationData() {
      if (!isConversationLoading) {
        setConversation(conversationData || null);
      }
    }
    setConversationData();
  }, [isConversationLoading]);

  const getImageUrl = (fileName: string, userId: string): string => {
    return `http://localhost:4000/message/images/${conversation?._id}/${userId}/${fileName}`;
  };

  const handleScroll = async () => {
    const element = scrollRef.current;
    if (element && element.scrollTop === 0) {
      if (!isThereMoreMessages) return;

      // Store current scroll height before fetching
      const scrollHeightBefore = element.scrollHeight;
      const conversationId = conversation?._id!;
      const lastDateAsCursor = messages[0].createdAt;
      setIsFetchingMore(true);

      await fetchMessages(conversationId, lastDateAsCursor, scrollHeightBefore);
    }
  };

  useEffect(() => {
    console.log("scrollRef.current.scrollTop", scrollRef.current?.scrollTop);
  }, [scrollRef.current]);

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
            {isFetchingMore && (
              <div className="message-loading">
                <Spinner />
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
                              getImageUrl(msg.attachments!, msg.sender)
                            )
                          )
                        }
                      >
                        <img
                          src={getImageUrl(msg.attachments, msg.sender)}
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
