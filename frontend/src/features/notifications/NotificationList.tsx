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

  const capitializeFristWord = (text: string) => {
    return String(text).charAt(0).toUpperCase() + String(text).slice(1);
  };

  return (
    <div className="notif-cont">
      {loading ? (
        <>Loading</>
      ) : (
        allIds.map((id, index) => {
          const senderId = byId[id].sender; // get sender by notif
          const senderData = userById[senderId];

          return (
            <div
              className={`notif-container ${
                !byId[id].read && "unread-backgroud"
              }`}
              key={index}
            >
              <div className="notif-content">
                <div className="type-logo">
                  <span className="material-symbols-outlined">
                    {displayLogoType(byId[id].type)}
                  </span>
                </div>
                <div
                  className={`notif-message ${
                    !byId[id].read && "unread-message"
                  }`}
                >{`${
                  senderData ? capitializeFristWord(senderData.username) : "..."
                } ${byId[id].message}`}</div>
              </div>
              <div className="notif-data">
                <span>{new Date(byId[id].createdAt).toLocaleString()}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default NotificationList;
