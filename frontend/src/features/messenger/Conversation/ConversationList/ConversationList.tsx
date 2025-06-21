import "./ConversationList.css";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import Spinner from "../../../../Components/Spinner/Spinner";
import { fetchAllConvoList } from "../conversationSlice";

import { openChatWindow } from "../../../../Components/Modal/globalSlice";
import ContactList from "../../Contact/ContactList";
import { fetchAllContact } from "../../Contact/ContactSlice";
import { FetchedUserType } from "../../../../types/user";
import { userProfile } from "../../../../utils/ImageUrlHelper";

interface ConversationListPorp {
  currentUser: FetchedUserType;
}

const ConversationList = ({ currentUser }: ConversationListPorp) => {
  const dispatch: AppDispatch = useDispatch();

  const { allIds, byId, loading } = useSelector(
    (state: RootState) => state.conversation
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
    const fetchData = async () => {
      try {
        await dispatch(fetchAllContact());
        await dispatch(fetchAllConvoList());
      } catch (error) {
        console.error(
          "Failed to fetch data for conversation and contact list, ",
          error
        );
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
          ) : allIds.length === 0 ? (
            <>No Conversation</>
          ) : (
            allIds.map((id, index) => {
              const conversation = byId[id];

              if (!conversation || !conversation.lastMessage) {
                return null;
              }
              const { participant, lastMessage } = conversation;

              let isLastMessageCurrUser =
                lastMessage.sender === currentUser._id;

              const isLastMessageRead = lastMessage.read;

              const addBold = isLastMessageRead
                ? ""
                : isLastMessageCurrUser
                ? ""
                : "unread-chat";

              return (
                <>
                  <div
                    className={`chat-container ${addBold}`}
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
                          src={userProfile(
                            participant.profilePicture!,
                            participant._id
                          )}
                          alt=""
                        />
                        <h4 className={`${addBold}`}>
                          {`${participant.fullName}(${participant.username})`}
                        </h4>
                      </div>
                      <span>
                        {new Date(conversation.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="chat-content-count">
                      <div className="chat-content">
                        {!lastMessage.content &&
                        (lastMessage.attachments as string)
                          ? "send a picc"
                          : lastMessage.content}
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
