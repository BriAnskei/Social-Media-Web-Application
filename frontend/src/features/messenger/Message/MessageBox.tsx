import "./MessageBox.css";
import { ChatWindowType, Message } from "../../../types/MessengerTypes";
import { useMessegesOnConvoId } from "../../../hooks/useMessage";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import {
  closeWindow,
  minimizeChat,
} from "../../../Components/Modal/globalSlice";

interface MessageBoxProp {
  chat: ChatWindowType;
  onClose: (id: string) => void;
  toggleMin: (id: string) => void;
  onSendMessage: (id: string, content: string) => void;
}

const MessageBox = ({
  chat,
  onClose,
  toggleMin,
  onSendMessage,
}: MessageBoxProp) => {
  const dispatch = useDispatch<AppDispatch>();

  const messegeUser = chat.userId;
  const currUserId = "5f8d0d55b54764421b7156d1"; // example
  const messageData: Message[] = useMessegesOnConvoId(chat.convoId);

  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    setMessages(messageData);
  }, [chat]);

  useEffect(() => {
    if (messagesRef && messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messagesRef, messages]);

  const closeChat = () => {
    if (chat.minimized) return;
    dispatch(closeWindow({ convoId: chat.convoId }));
  };

  return (
    <div
      className={`messenger-container ${chat.minimized ? "minimized" : ""}`}
      onClick={() =>
        !chat.minimized
          ? undefined
          : dispatch(minimizeChat({ convoId: chat.convoId }))
      }
    >
      <div className="chatwindow-header">
        <div className="chatwindow-profile">B</div>
        <div className="chatwindow-nm">{chat.convoId}</div>
        <div className="chatwindow-icons">
          <span
            className="chatwindow-min"
            onClick={() => dispatch(minimizeChat({ convoId: chat.convoId }))}
          >
            -
          </span>
          <span className="chatwindow-cls" onClick={closeChat}>
            x
          </span>
        </div>
      </div>

      <div className="chat-area" ref={messagesRef}>
        {messages.map((msg, index) => {
          const isoString = msg.createdAt;
          const date = new Date(isoString);

          const nextMsg = messages[index + 1];
          let nxtMsgDate;
          if (nextMsg) {
            const isoString = nextMsg.createdAt;
            nxtMsgDate = new Date(isoString);
          }

          const showDate =
            nxtMsgDate && date.toDateString() !== nxtMsgDate.toDateString();

          return (
            <div key={index} className="message-containter">
              {msg.attachments && (
                <div
                  className={`chat-window-img ${
                    msg.recipient === currUserId ? "img-sent" : "img-recieved"
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
        })}
      </div>
      <div className="input-area">
        <input type="text" placeholder="Message..." className="message-input" />
        <button className="sent-button">➤</button>
      </div>
    </div>
  );
};

export default MessageBox;
