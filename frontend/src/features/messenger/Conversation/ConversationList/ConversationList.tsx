import "./ConversationList.css";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import Spinner from "../../../../Components/Spinner/Spinner";

import { fetchAllConvoList } from "../conversationSlice";
import { fetchAllMesseges } from "../../Message/messengerSlice";
import { Conversation } from "../../../../types/MessengerTypes";
import { openChatWindow } from "../../../../Components/Modal/globalSlice";
import ContactList from "../../Contact/ContactList";
import { fetchAllContact } from "../../Contact/ContactSlice";
import { useCurrentUser } from "../../../../hooks/useUsers";

const ConversationList = () => {
  const dispatch: AppDispatch = useDispatch();
  const { currentUser } = useCurrentUser();

  const currUser = "5f8d0d55b54764421b7156d1";
  const {
    allIds,
    byId,
    loading: convoLoading,
  } = useSelector((state: RootState) => state.conversation);

  const { byId: messagesById, loading: messageLoading } = useSelector(
    (state: RootState) => state.message
  );

  const closeDropDown = () => {
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

  useEffect(() => {
    const fetchMessages = async () => {
      await dispatch(fetchAllContact());
      await dispatch(fetchAllConvoList(currUser)); // assuming this is the user id(currentuser)
      await dispatch(fetchAllMesseges()); // might call this when openning the conversation window
    };

    fetchMessages();
  }, []);

  const handleChatClick = (chat: Conversation) => {
    // close dropdown fist
    closeDropDown();

    const data = {
      ...chat,
      currUserId: currUser,
    };

    dispatch(openChatWindow(data));
  };

  return (
    <>
      <div className="conversationList-cont">
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
        <ContactList />
        <div className="chat-list">
          {messageLoading && convoLoading && messagesById ? (
            <Spinner />
          ) : (
            allIds.map((id, index) => {
              const conversation = byId[id];
              const latestMessage = messagesById[conversation.lastMessage];
              const unRead = conversation.unreadCounts.find(
                (un) => un.user === currUser
              );

              if (!(conversation && latestMessage)) {
                return (
                  <div key={index}>
                    <Spinner />
                  </div>
                );
              }

              const isUnreadUser = latestMessage.sender === currUser;

              return (
                <div
                  className={`chat-container ${
                    latestMessage.read ? "" : isUnreadUser ? "" : "unread-chat"
                  }`}
                  key={index}
                  onClick={() => handleChatClick(conversation)}
                >
                  <div className="chat-info">
                    <div className="info-picc">
                      <img
                        src="https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg"
                        alt=""
                      />
                      <h4
                        className={`${
                          latestMessage.read
                            ? ""
                            : isUnreadUser
                            ? ""
                            : "bold-header"
                        }`}
                      >
                        {latestMessage.sender}
                      </h4>
                    </div>
                    <span>
                      {new Date(conversation.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="chat-content-count">
                    <div className="chat-content">{latestMessage.content}</div>
                    {unRead && unRead.count > 0 && (
                      <div className="unread-count">{unRead.count}</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default ConversationList;
