import "./NotificationList.css";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const NotificationList = () => {
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
      default:
        return "notification_important";
    }
  };

  const viewPost = (postId: string) => {
    console.log(postId);
  };

  const capitializeFristWord = (text: string) => {
    return String(text).charAt(0).toUpperCase() + String(text).slice(1);
  };

  return (
    <div className="notif-cont">
      {loading ? (
        <>Loading</>
      ) : (
        allIds.map((id, index) => {
          const notifData = byId[id];
          const senderId = notifData.sender; // get sender by notif

          const senderData = userById[senderId];

          return (
            <div
              className={`notif-container ${
                !notifData.read ? "unread-backgroud" : ""
              }`}
              key={index}
              onClick={
                notifData.type === "like"
                  ? () => viewPost(notifData.post!)
                  : undefined
              }
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
                  senderData ? capitializeFristWord(senderData.username) : "..."
                } ${notifData.message}`}</div>
              </div>
              <div className="notif-data">
                <span>{new Date(notifData.createdAt).toLocaleString()}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default NotificationList;
