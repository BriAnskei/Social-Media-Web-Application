import "./ChatList.css";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { fetchChats } from "../messengerSlice";

const ChatList = () => {
  const dispatch: AppDispatch = useDispatch();
  const chats = useSelector((state: RootState) => state.chats.chats);
  const isLoading = useSelector((state: RootState) => state.chats.loading);

  useEffect(() => {
    dispatch(fetchChats());
  }, []);



  return (
    <>
      <div className="chatlist-cont">
        {chats.map((chat, index) => (
          <div className="chat-container" key={index}>
            <div className="chat-info">
              <div className="info-picc">
                <img
                  src="https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg"
                  alt=""
                />
                <h4 className="sender">{chat.sender}</h4>
              </div>
              <span>{new Date(chat.createdAt).toLocaleString()}</span>
            </div>
            <div className="chat-content">{chat.content}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ChatList;
