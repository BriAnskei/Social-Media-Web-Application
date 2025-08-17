import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchAllNotifs } from "./notificationsSlice";

interface NotificationListProp {
  listOnClick: (postId: string | undefined, type: string) => void;
  displayLogoType: (notificationType: string) => string;
  dispatch: AppDispatch;
}

const NotificationList = ({
  listOnClick,
  displayLogoType,
  dispatch,
}: NotificationListProp) => {
  const { allIds, byId, loading, hasMore, fetchingMore } = useSelector(
    (state: RootState) => state.notification
  );

  const notifScrollRef = useRef<HTMLDivElement | null>(null);

  const showDateCreationDetails = (createdAt: Date) => {
    const created = new Date(createdAt);
    const now = new Date();

    const isSameDay =
      now.getDate() === created.getDate() &&
      now.getMonth() === created.getMonth() &&
      now.getFullYear() === created.getFullYear();

    if (isSameDay) {
      return showOnlyTime(created); // implement this function to format time
    }

    if (now.getDate() - createdAt.getDate() <= 4) {
      console.log("who days ago");
    } else {
      return showOnlyDate(created); // implement this function to format date
    }
  };

  const showOnlyTime = (createdAt: Date) => {
    return new Date(createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // Set to false if you want 24-hour format
    });
  };

  const showOnlyDate = (createdAt: Date) => {
    return new Date(createdAt).toLocaleDateString();
  };

  const handleScroll = async () => {
    const element = notifScrollRef.current;

    // return undifine reference or no more notifs
    if (!element || !hasMore || fetchingMore) return;

    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const offsetHeight = element.offsetHeight;

    if (scrollTop === scrollHeight - offsetHeight) {
      await fetchMoreNotifs();
    }
  };

  const fetchMoreNotifs = useCallback(async () => {
    try {
      const cursor: string = new Date(
        byId[allIds[allIds.length - 1]].createdAt
      ).toISOString();

      await dispatch(fetchAllNotifs({ cursor }));
    } catch (error) {
      console.log("Failed to fetch more comments: ", error);
    }
  }, [allIds]);

  return (
    <div className="notif-list" ref={notifScrollRef} onScroll={handleScroll}>
      {loading ? (
        <>Loading</>
      ) : (
        allIds.map((id, index) => {
          const notifData = byId[id];

          return (
            <div
              className={`notification ${
                !notifData.read ? "unread-backgroud" : ""
              }  ${
                notifData.type === "upload" ||
                notifData.type === "comment" ||
                notifData.type === "like"
                  ? "cursor-onclick"
                  : ""
              }`}
              key={index}
              onClick={() => listOnClick(notifData.post, notifData.type)}
            >
              <div className="notif-content">
                <div className="type-logo">
                  <span className="material-symbols-outlined">
                    {displayLogoType(notifData.type)}
                  </span>
                </div>
                <div
                  className={`notif-message ${
                    !notifData.read && "unread-message"
                  }`}
                >{` ${notifData.message}`}</div>
              </div>
              <div className="notif-data">
                <span>{showDateCreationDetails(notifData.createdAt)}</span>
              </div>
            </div>
          );
        })
      )}
      {fetchingMore && <>Fething more</>}
    </div>
  );
};

export default NotificationList;
