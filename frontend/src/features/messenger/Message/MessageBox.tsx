import "./MessageBox.css";
import { Conversation, Message } from "../../../types/MessengerTypes";
import { useMessegesOnConvoId } from "../../../hooks/useMessage";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import {
  ChatWindowType,
  closeWindow,
  openChatWindow,
  toggleMinimize,
} from "../../../Components/Modal/globalSlice";
import Spinner from "../../../Components/Spinner/Spinner";
import { FetchedUserType } from "../../../types/user";
import { monthNames } from "./monthNames";
import { openConversation } from "../Conversation/conversationSlice";
import { fetchMessagesByConvoId } from "./messengeSlice";
import { ConversationType } from "../../../types/MessengerTypes";

interface MessageBoxProp {
  ChatWindowData: ChatWindowType;
  currentUserData: FetchedUserType;
}

const MessageBox = ({ ChatWindowData, currentUserData }: MessageBoxProp) => {
  const dispatch = useDispatch<AppDispatch>();
  const [conversation, setConversation] = useState<ConversationType>(
    {} as ConversationType
  );

  const { contactId, participantId, minimized } = ChatWindowData;
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchAllConversartionData = async () => {
      try {
        const data = {
          otherUser: participantId,
          contactId,
        };
        const conversationRes: ConversationType = await dispatch(
          openConversation(data)
        ).unwrap();

        setConversation(conversationRes);
        await dispatch(fetchMessagesByConvoId(contactId));
      } catch (error) {
        console.error("Failed to fetch data for chat window, ", error);
      }

      await fetchAllConversartionData();
    };
  }, []);

  useEffect(() => {
    if (messagesRef && messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messagesRef]);

  const closeChat = () => {
    if (ChatWindowData.minimized) return;
    dispatch(closeWindow({ convoId: contactId }));
  };

  const isConvoLoading = false;
  const isMessagesLoading = false;

  return (
    <div
      className={`messenger-container ${
        isConvoLoading ? "center-spinner" : ""
      } ${minimized ? "minimized" : ""}`}
      onClick={() =>
        !minimized ? undefined : dispatch(toggleMinimize({ contactId }))
      }
    >
      {isConvoLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="chatwindow-header">
            <div className="chatwindow-profile">B</div>
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
          <div className="chat-area" ref={messagesRef}>
            {isMessagesLoading ? (
              <Spinner />
            ) : (
              messages.map((msg, index) => {
                const isoString = msg.createdAt;
                const date = new Date(isoString);

                const nextMsg = messages[index + 1];
                let nxtMsgDate;
                if (nextMsg) {
                  const isoString = nextMsg.createdAt;
                  nxtMsgDate = new Date(isoString);
                }

                const showDate =
                  nxtMsgDate &&
                  date.toDateString() !== nxtMsgDate.toDateString();

                return (
                  <div key={index} className="message-containter">
                    {msg.attachments && (
                      <div
                        className={`chat-window-img ${
                          msg.recipient === currUserId
                            ? "img-sent"
                            : "img-recieved"
                        }`}
                        onClick={() =>
                          window.open(msg.attachments!, "_blank")?.focus()
                        }
                      >
                        <img src={msg.attachments} alt="" />
                      </div>
                    )}
                    <div
                      key={msg._id}
                      className={`message ${
                        msg.recipient === currUserId ? "sent" : "recieved"
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

                    {showDate && (
                      <div className="message-date">
                        {monthNames[date.getMonth()]}
                        {"  " + date.getDate() + " " + date.getFullYear()}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <div className="input-area">
            <input
              type="text"
              placeholder="Message..."
              className="message-input"
            />
            <button className="sent-button">➤</button>
          </div>
        </>
      )}
    </div>
  );
};

export default MessageBox;
