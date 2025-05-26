import "./ConversationList.css";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import Spinner from "../../../../Components/Spinner/Spinner";
import { fetchAllConvoList } from "../conversationSlice";
import { ConversationType } from "../../../../types/MessengerTypes";
import { openChatWindow } from "../../../../Components/Modal/globalSlice";
import ContactList from "../../Contact/ContactList";
import { fetchAllContact } from "../../Contact/ContactSlice";
import { FetchedUserType } from "../../../../types/user";

interface ConversationListPorp {
  currentUser: FetchedUserType;
}

const ConversationList = ({ currentUser }: ConversationListPorp) => {
  const dispatch: AppDispatch = useDispatch();

  const { allIds, byId, loading } = useSelector(
    (state: RootState) => state.conversation
  );

  useEffect(() => {
    console.log("update: ", byId);
  }, [byId]);

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
    const fetchData = async () => {
      try {
        await dispatch(fetchAllContact());
        await dispatch(fetchAllConvoList());
      } catch (error) {
        console.error("Failed to fetch data for conversation list, ", error);
      }
    };

    fetchData();
  }, []);

  const openConversation = (contactId: string, participantId: string) => {
    // close dropdown fist
    closeDropDown();

    dispatch(openChatWindow({ contactId, participantId }));
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
        <ContactList openConversation={openConversation} />
        <div className="chat-list">
          {loading ? (
            <Spinner />
          ) : (
            allIds.map((id, index) => {
              const conversation = byId[id];

              if (!conversation) {
                return (
                  <div key={index}>
                    <Spinner />
                  </div>
                );
              }

              const isLastMessageCurrUser =
                conversation.lastMessage.sender === currentUser._id;

              const isLastMessageRead = conversation.lastMessage.read;

              return (
                <>
                  <div
                    className={`chat-container ${
                      isLastMessageRead
                        ? ""
                        : isLastMessageCurrUser
                        ? ""
                        : "unread-chat"
                    }`}
                    key={index}
                    onClick={() =>
                      openConversation(
                        conversation.contactId,
                        conversation.participant._id
                      )
                    }
                  >
                    <div className="chat-info">
                      <div className="info-picc">
                        <img
                          src="https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg"
                          alt=""
                        />
                        <h4
                          className={`${
                            isLastMessageRead && isLastMessageCurrUser
                              ? ""
                              : "bold-header"
                          }`}
                        >
                          {}
                        </h4>
                      </div>
                      <span>
                        {new Date(conversation.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="chat-content-count">
                      <div className="chat-content">
                        {conversation.lastMessage.content ||
                        conversation.lastMessage.attachments
                          ? "send a picc"
                          : ""}
                      </div>
                      {conversation.unreadCounts > 0 && (
                        <div className="unread-count">
                          {conversation.unreadCounts}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default ConversationList;
