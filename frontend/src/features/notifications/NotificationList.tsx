import "./NotificationList.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { useEffect } from "react";

const NotificationList = () => {
  const dispatch: AppDispatch = useDispatch();
  const { allIds, byId } = useSelector(
    (state: RootState) => state.notification
  );

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
      {allIds.map((id, index) => (
        <div className="notif-container" key={index}>
          <div className="notif-content">
            <div className="type-logo">
              <span className="material-symbols-outlined">
                {displayLogoType(byId[id].type)}
              </span>
            </div>
            <div className="notif-message">{byId[id].message}</div>
          </div>
          <div className="notif-data">
            <span>{new Date(byId[id].createdAt).toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
