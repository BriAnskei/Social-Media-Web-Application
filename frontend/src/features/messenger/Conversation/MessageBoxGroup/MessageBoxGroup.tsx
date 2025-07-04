import React from "react";
import { ConversationType } from "../../../../types/MessengerTypes";
import { Spinner } from "react-bootstrap";
import { MessageSpinner } from "../../../../Components/Spinner/Spinner";
import ConvoBox from "./ConvoBox";

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
        allIds.map((id) => {
          const conversation = byId[id];

          return (
            <ConvoBox
              currUserId={currUserId}
              conversation={conversation}
              openConvoOnMessageBox={openConvoOnMessageBox}
            />
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
