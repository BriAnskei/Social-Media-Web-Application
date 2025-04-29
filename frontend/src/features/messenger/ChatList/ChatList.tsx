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

  const handleChatClick = () => {
    // Find all open dropdown menus and remove their 'show' class
    const dropDown = document.querySelector(".dropdown-menu.show");

    if (dropDown) {
      dropDown.classList.remove("show");
      // Also update aria-expanded attribute on the toggle element
      const toggleElement = dropDown.previousElementSibling;
      if (toggleElement && toggleElement.hasAttribute("aria-expanded")) {
        toggleElement.setAttribute("aria-expanded", "false");
      }
    }
  };

  return (
    <>
      <div className="chatlist-cont">
        <div className="chats-header">
          <span>Chats</span>
          <div className="search-chat">
            <input type="text" placeholder="Search chat" />
            <span
              className="material-symbols-outlined"
              style={{ cursor: "pointer" }}
            >
              search
            </span>
          </div>
        </div>

        <div className="chat-list">
          {chats.map((chat, index) => (
            <div
              className={`chat-container ${!chat.isRead ? "" : "unread-chat"}`}
              key={index}
              onClick={handleChatClick}
            >
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
      </div>
    </>
  );
};

export default ChatList;
