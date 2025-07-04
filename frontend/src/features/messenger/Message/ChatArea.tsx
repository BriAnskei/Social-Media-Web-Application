import React from "react";
import { Message } from "../../../types/MessengerTypes";
import { Spinner } from "react-bootstrap";
import { monthNames } from "../../../assets/monthNames";
import { toggleViewMessageImage } from "../../../Components/Modal/globalSlice";
import { MessageSpinner } from "../../../Components/Spinner/Spinner";
import { getMessageImageUrl } from "../../../utils/ImageUrlHelper";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";

interface ChatAreaProp {
  hasMore: boolean;
  isFetchingMore: boolean;
  isMessagesNotReady: boolean;
  messages: Message[];
  handleScroll: () => void;
  scrollRef: React.MutableRefObject<any>;
  conversationId: string;
  currentUserId: string;
  messagesRef: React.MutableRefObject<HTMLDivElement | null>;
}

const ChatArea = (prop: ChatAreaProp) => {
  const {
    scrollRef,
    handleScroll,
    hasMore,
    isFetchingMore,
    isMessagesNotReady,
    messages,
    conversationId,
    currentUserId,
    messagesRef,
  } = prop;

  const dispatch = useDispatch<AppDispatch>();

  const noMoreOlderMessages = messages && messages.length >= 7 && !hasMore;

  return (
    <div className="chat-area" ref={scrollRef} onScroll={handleScroll}>
      {/* No Conversation to fetch */}
      {noMoreOlderMessages && (
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spinner />
        </div>
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

          const isMessageOwner = msg.sender === currentUserId;

          const isMessageDiffDate =
            nxtMsgDate && date.toDateString() !== nxtMsgDate.toDateString();

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
                          conversationId
                        )
                      )
                    )
                  }
                >
                  <img
                    src={getMessageImageUrl(
                      msg.attachments! as string,
                      msg.sender,
                      conversationId
                    )}
                    alt=""
                  />
                </div>
              )}
              {/* message content */}
              {msg.content && (
                <div
                  key={msg._id}
                  className={`message ${isMessageOwner ? "sent" : "recieved"}`}
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
  );
};

export default ChatArea;
