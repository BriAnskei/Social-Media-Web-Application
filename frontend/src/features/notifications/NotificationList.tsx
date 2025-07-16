import "./NotificationList.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";

import { useNavigate } from "react-router";
import { viewPost } from "../../Components/Modal/globalSlice";
import { faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const NotificationList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { allIds, byId, loading } = useSelector(
    (state: RootState) => state.notification
  );

  const userById = useSelector((state: RootState) => state.user.byId);

  const displayLogoType = (notificationType: string): string => {
    switch (notificationType) {
      case "like":
        return "thumb_up";
      case "follow":
        return "person_add";
      case "comment":
        return "forum";
      case "upload":
        return "notification_add";
      default:
        return "notification_important";
    }
  };

  const listOnClick = async (postId: string | undefined, type: string) => {
    if (!type) throw new Error("No type to dispatch this action");

    if (type === "upload" || type === "comment" || type === "like") {
      if (!postId) throw new Error("No postId to dispatch this action");

      dispatch(viewPost(postId));
      navigate("/viewpost");
    }
  };

  const capitializeFristWord = (text: string) => {
    return String(text).charAt(0).toUpperCase() + String(text).slice(1);
  };

  const showDateCreationDetails = (createdAt: Date) => {
    const created = new Date(createdAt);
    const now = new Date();

    const isSameDay =
      now.getDate() === created.getDate() &&
      now.getMonth() === created.getMonth() &&
      now.getFullYear() === created.getFullYear();

    if (isSameDay) {
      return showOnlyTime(created); // implement this function to format time
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

  return (
    <div className="notif-container">
      <div className="notif-header">
        <FontAwesomeIcon icon={faXTwitter} />
        <span>Notification</span>
      </div>
      <div className="notif-list">
        {loading ? (
          <>Loading</>
        ) : (
          allIds.map((id, index) => {
            const notifData = byId[id];
            const senderId = notifData.sender; // get sender by notif

            const senderData = userById[senderId];

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
                  >{`${
                    senderData
                      ? capitializeFristWord(senderData.username)
                      : "..."
                  } ${notifData.message}`}</div>
                </div>
                <div className="notif-data">
                  <span>{showDateCreationDetails(notifData.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationList;
