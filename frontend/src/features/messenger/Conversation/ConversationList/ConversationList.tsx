import "./ConversationList.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";

import ContactList from "../../Contact/ContactList";
import { clearFilter, fetchAllContact } from "../../Contact/ContactSlice";
import { FetchedUserType } from "../../../../types/user";
import { ConversationService } from "../../../../services/conversation.service";
import MessageBoxGroup from "../MessageBoxGroup/MessageBoxGroup";
import { fetchAllConvoList } from "../conversationSlice";
import SearchConvoHandler from "./SearchConvoHandler";
import { ConversationType } from "../../../../types/MessengerTypes";

interface ConversationListPorp {
  currentUser: FetchedUserType;
  isDropDownShown: boolean;
}

const ConversationList = ({
  currentUser,
  isDropDownShown,
}: ConversationListPorp) => {
  const dispatch: AppDispatch = useDispatch();

  const { allIds, searchedIds, byId, loading, isFetchingMore } = useSelector(
    (state: RootState) => state.conversation
  );

  // pagination
  const [hasMore, setHasMore] = useState<boolean>(true);

  // on search/filter
  const [hasSearch, setHasSearch] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchConversation, setSearch] = useState<string>("");

  const convoListScrollRef = useRef<any>(null);
  const prevScrollViewRef = useRef<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      async function initialFetch() {
        try {
          await dispatch(fetchAllContact({}));
          await fetchConversationList();
        } catch (error) {
          console.log("Faild on initial fetch");
        }
      }

      initialFetch();
    };

    fetchData();
  }, []);

  // dropdown listener
  useEffect(() => {
    if (!isDropDownShown) {
      setSearch("");
      dispatch(clearFilter());
    }
  }, [isDropDownShown]);

  const closeDropDown = () => {
    // Find all open dropdown menus and remove their 'show' class
    const dropDown = document.getElementById("convoDropdown");

    if (dropDown) {
      dropDown.classList.remove("show");
      // Also update aria-expanded attribute on the toggle element
      const toggleElement = dropDown.previousElementSibling;
      if (toggleElement && toggleElement.hasAttribute("aria-expanded")) {
        toggleElement.setAttribute("aria-expanded", "false");
      }
    }
  };

  const handleScroll = () => {
    const element = convoListScrollRef.current;
    const scrollTop = element.scrollTop;

    const scrollHeight = element.scrollHeight;
    const offsetHeight = element.offsetHeight;

    if (scrollTop === scrollHeight - offsetHeight && !isFetchingMore) {
      prevScrollViewRef.current = scrollHeight - offsetHeight;

      loadMoreConversations();
    }
  };

  const fetchConversationList = useCallback(async () => {
    try {
      const cursor = getCursor(allIds, byId);

      const response = await dispatch(fetchAllConvoList({ cursor })).unwrap();
      const isHasMore = response?.hasMore as boolean;

      setHasMore(isHasMore);
    } catch (error) {
      console.error("Error on fetchConversationList, ", error);
    }
  }, [hasMore, allIds]);

  const openConvoOnMessageBox = async (
    contactId: string,
    participantId: string
  ) => {
    try {
      await ConversationService.findConversation(
        participantId,
        contactId,
        dispatch
      );

      closeDropDown();
    } catch (error) {
      console.error("Failed to openConvoOnMessageBox, ", error);
    }
  };

  const loadMoreConversations = useCallback(async () => {
    if (!hasMore) return;

    await fetchConversationList();

    setUpViewHeight();
  }, [hasMore, allIds]);

  const setUpViewHeight = () => {
    setTimeout(() => {
      convoListScrollRef.current.scrollTop = prevScrollViewRef.current;
    }, 0);
  };

  return (
    <>
      <div className="conversationList-cont">
        <div className="chats-header">
          <h3>Chats</h3>
          <div className="search-chat">
            <SearchConvoHandler
              searchConversation={searchConversation}
              setSearch={setSearch}
              setSearchLoading={setSearchLoading}
              setHasSearch={setHasSearch}
              dispatch={dispatch}
            />
          </div>
        </div>
        <ContactList
          isDropDownShown={isDropDownShown}
          openConversation={openConvoOnMessageBox}
          dispatch={dispatch}
        />
        <MessageBoxGroup
          searchLoading={searchLoading}
          hasSearch={hasSearch}
          convoListScrollRef={convoListScrollRef}
          searchIds={searchedIds}
          byId={byId}
          allIds={allIds}
          currUserId={currentUser._id}
          isFetchingMore={isFetchingMore}
          loading={loading as boolean}
          openConvoOnMessageBox={openConvoOnMessageBox}
          handleScroll={handleScroll}
        />
      </div>
    </>
  );
};

export default ConversationList;

function getCursor(
  allIds: string[],
  byId: { [key: string]: ConversationType }
): string | null {
  return allIds.length > 0
    ? byId[allIds[allIds.length - 1]].lastMessageAt
    : null;
}
