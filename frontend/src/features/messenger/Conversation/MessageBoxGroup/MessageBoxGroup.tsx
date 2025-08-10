import React, { useEffect } from "react";
import { ConversationType } from "../../../../types/MessengerTypes";
import { Spinner } from "react-bootstrap";
import { MessageSpinner } from "../../../../Components/Spinner/Spinner";
import ConvoBox from "./ConvoBox";

interface MessageBoxGroupProp {
  loading: boolean;
  isFetchingMore: boolean;
  allIds: string[];
  searchIds: string[];
  searchLoading: boolean;
  hasSearch: boolean;
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
  searchLoading,
  searchIds,
  allIds,
  hasSearch,
  currUserId,
  isFetchingMore,
  loading,
}: MessageBoxGroupProp) => {
  const convoIds = hasSearch ? searchIds : allIds;

  return (
    <div className="chat-list" ref={convoListScrollRef} onScroll={handleScroll}>
      {loading || searchLoading ? (
        <Spinner />
      ) : convoIds.length === 0 ? (
        <>{hasSearch ? <>Conversation not found</> : <>No Conversation</>}</>
      ) : (
        convoIds.map((id) => {
          const conversation = byId[id];

          return (
            <ConvoBox
              key={id}
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
