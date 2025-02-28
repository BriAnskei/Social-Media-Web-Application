import "./NotificationList.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { useEffect } from "react";

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

  return (
    <div className="notif-cont">
      {loading ? (
        <>Loading</>
      ) : (
        allIds.map((id, index) => {
          const senderId = byId[id].sender;

          const senderData = userById[senderId];

          return (
            <div className="notif-container" key={index}>
              <div className="notif-content">
                <div className="type-logo">
                  <span className="material-symbols-outlined">
                    {displayLogoType(byId[id].type)}
                  </span>
                </div>
                <div className="notif-message">{`${
                  senderData ? senderData.username : "unknown user"
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
