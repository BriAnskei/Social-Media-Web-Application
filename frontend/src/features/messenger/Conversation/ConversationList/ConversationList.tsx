import "./ConversationList.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";

import ContactList from "../../Contact/ContactList";
import { fetchAllContact } from "../../Contact/ContactSlice";
import { FetchedUserType } from "../../../../types/user";
import { ConversationService } from "../../../../services/conversation.service";
import MessageBoxGroup from "../MessageBoxGroup/MessageBoxGroup";
import { fetchAllConvoList } from "../conversationSlice";
import SearchConvoHandler from "./SearchConvoHandler";

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

  const [hasMore, setHasMore] = useState<boolean>(true);

  const [hasSearch, setHasSearch] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchConversation, setSearch] = useState<string>("");

  const convoListScrollRef = useRef<any>(null);
  const prevScrollViewRef = useRef<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      async function initialFetch() {
        try {
          await dispatch(fetchAllContact());
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
      const cursor = getCursor();

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

  const getCursor = (): string | null => {
    return allIds.length > 0
      ? byId[allIds[allIds.length - 1]].lastMessageAt
      : null;
  };
  const setUpViewHeight = () => {
    setTimeout(() => {
      convoListScrollRef.current.scrollTop = prevScrollViewRef.current;
    }, 0);
  };

  return (
    <>
      <div className="conversationList-cont">
        <div className="chats-header">
          <span>Chats</span>
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
        <ContactList openConversation={openConvoOnMessageBox} />
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
