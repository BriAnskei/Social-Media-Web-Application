import { useSelector } from "react-redux";
import "./ContactList.css";
import { AppDispatch, RootState } from "../../../store/store";
import { userProfile } from "../../../utils/ImageUrlHelper";
import Spinner, { MessageSpinner } from "../../../Components/Spinner/Spinner";
import { useEffect, useMemo, useRef, useState } from "react";

import { clearFilter, fetchAllContact } from "./ContactSlice";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";

interface ContactListProp {
  openConversation: (contactId: string, participantId: string) => void;
  dispatch: AppDispatch;
  isDropDownShown: boolean;
}

const ContactList = ({
  openConversation,
  dispatch,
  isDropDownShown,
}: ContactListProp) => {
  const {
    allIds,
    byId,
    loading,
    filterLoading,
    searchedIds,
    filterByIds,
    hasMore,
    hasFilter,
    fetchingMore,
  } = useSelector((state: RootState) => state.contact);

  const contactIds: string[] = useMemo(
    () => (hasFilter ? searchedIds : allIds),
    [allIds, searchedIds]
  );

  const contactById = useMemo(
    () => (hasFilter ? filterByIds : byId),
    [byId, filterByIds]
  );

  useEffect(() => {
    console.log("contact list update: ", contactIds);
  }, [contactIds]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  let lastIndex = useMemo(() => contactIds.length - 1, [contactIds.length]);

  const fetchMore = async () => {
    try {
      const cursor = contactById[contactIds[lastIndex]].createdAt;
      await dispatch(fetchAllContact({ cursor }));
    } catch (error) {
      console.log("Failed on fetchMore", error);
    } finally {
    }
  };

  const lastContactRef = useInfiniteScroll(
    fetchMore,
    hasMore,
    (loading || filterLoading || fetchingMore) as boolean
  );

  useEffect(() => {
    if (!hasFilter) {
      dispatch(clearFilter());
    }
  }, [hasFilter]);

  useEffect(() => {
    async function initialFetch() {
      try {
        if (isDropDownShown) {
          setTimeout(() => {
            if (scrollRef.current) scrollRef.current.scrollLeft = 0;
          }, 200);
        }
      } catch (error) {
        console.log("Failed to fetch contacts: ", error);
      }
    }
    initialFetch();
  }, [isDropDownShown]);

  const onScroll = () => {};

  return (
    <>
      <div
        onScroll={onScroll}
        ref={scrollRef}
        className={`contact-list ${
          contactIds.length === 0 ? "no-contact" : ""
        }`}
      >
        {loading || filterLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <MessageSpinner />
          </div>
        ) : contactIds.length === 0 ? (
          <>No Contacts</>
        ) : (
          contactIds.map((id, index) => {
            const contactData = contactById[id];
            const userName = contactData.user.fullName.replace(/ .*/, "");

            return (
              <div
                ref={lastIndex === index ? lastContactRef : undefined}
                key={index}
                className="contact-container"
                onClick={() =>
                  openConversation(contactData._id, contactData.user._id)
                }
              >
                <img
                  src={userProfile(
                    contactData.user.profilePicture!,
                    contactData.user._id
                  )}
                />
                <div className="contact-name">{userName}</div>
              </div>
            );
          })
        )}
        {fetchingMore && (
          <div style={{ margin: "0 15px" }}>
            <Spinner />
          </div>
        )}
      </div>
    </>
  );
};

export default ContactList;
