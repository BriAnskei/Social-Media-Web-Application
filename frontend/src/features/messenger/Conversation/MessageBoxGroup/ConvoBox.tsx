import React, { useRef } from "react";
import { ConversationType } from "../../../../types/MessengerTypes";
import { userProfile } from "../../../../utils/ImageUrlHelper";
import { usePopoverContext } from "../../../../hooks/usePopover";

interface ConvoBoxProps {
  conversation: ConversationType;
  openConvoOnMessageBox: (
    contactId: string,
    participantId: string
  ) => Promise<void>;

  currUserId: string;
}

const ConvoBox = ({
  currUserId,
  conversation,
  openConvoOnMessageBox,
}: ConvoBoxProps) => {
  if (!conversation || !conversation.lastMessage) {
    return null;
  }

  const { chatProp } = usePopoverContext();
  const ref = useRef(null);

  const { participant, lastMessage } = conversation;

  const handleDeleteConvo = async (e: any, convoId: string) => {
    e.stopPropagation();
    e.preventDefault();
    chatProp.deleteConvoToggle({ ref, convoId });
  };

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
      key={conversation._id}
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
            src={userProfile(participant.profilePicture!, participant._id)}
            alt=""
          />
          <h4 className={`${addBold}`}>
            {`${participant.fullName}(${participant.username})`}
          </h4>
        </div>
        <div className="time-delete-act">
          <span>{new Date(conversation.updatedAt).toLocaleString()}</span>
          <span
            className="material-symbols-outlined more-icon delete-convo-icon"
            onClick={(e) => handleDeleteConvo(e, conversation._id)}
            ref={ref}
          >
            more_horiz
          </span>
        </div>
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
};

export default ConvoBox;
