import React from "react";
import { ConversationType } from "../../../../types/MessengerTypes";
import { Spinner } from "react-bootstrap";
import { userProfile } from "../../../../utils/ImageUrlHelper";
import { MessageSpinner } from "../../../../Components/Spinner/Spinner";

interface MessageBoxGroupProp {
  loading: boolean;
  isFetchingMore: boolean;
  allIds: string[];
  byId: { [key: string]: ConversationType };
  currUserId: string;
  convoListScrollRef: React.MutableRefObject<any>;
  handleScroll: () => void;
  openConvoOnMessageBox: (
    contactId: string,
    participantId: string
  ) => Promise<void>;
}

const MessageBoxGroup = ({
  handleScroll,
  openConvoOnMessageBox,
  convoListScrollRef,
  byId,
  allIds,
  currUserId,
  isFetchingMore,
  loading,
}: MessageBoxGroupProp) => {
  return (
    <div className="chat-list" ref={convoListScrollRef} onScroll={handleScroll}>
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

          let isLastMessageCurrUser = lastMessage.sender === currUserId;

          const isLastMessageRead = lastMessage.read;

          const addBold = isLastMessageRead
            ? ""
            : isLastMessageCurrUser
            ? ""
            : "unread-chat";

          return (
            <div
              className={`chat-container ${addBold}`}
              key={index}
              onClick={() =>
                openConvoOnMessageBox(
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
                <span>{new Date(conversation.updatedAt).toLocaleString()}</span>
              </div>
              <div className="chat-content-count">
                <div className="chat-content">
                  {!lastMessage.content && (lastMessage.attachments as string)
                    ? "send a picc"
                    : lastMessage.content}
                </div>
                {!isLastMessageRead && conversation.unreadCount > 0 && (
                  <div className="unread-count">{conversation.unreadCount}</div>
                )}
              </div>
            </div>
          );
        })
      )}
      {isFetchingMore && (
        <div className="conversation-fetching">
          <MessageSpinner />
        </div>
      )}
    </div>
  );
};

export default MessageBoxGroup;
