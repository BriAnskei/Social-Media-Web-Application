import "./NotificationList.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { useEffect } from "react";
import { fetchNotifs } from "./notificationsSlice";

const NotificationList = () => {
  const dispatch: AppDispatch = useDispatch();
  const notifications = useSelector(
    (state: RootState) => state.notification.notification
  );
  const isLoading = useSelector(
    (state: RootState) => state.notification.loading
  );

  useEffect(() => {
    dispatch(fetchNotifs());
  }, []);

  const displayLogoType = (notificationType: string) => {
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
      {notifications.map((notification, index) => (
        <div className="notif-container" key={index}>
          <div className="notif-content">
            <div className="type-logo">
              <span className="material-symbols-outlined">
                {displayLogoType(notification.type)}
              </span>
            </div>
            <div className="notif-message">{notification.message}</div>
          </div>
          <div className="notif-data">
            <span>{new Date(notification.createdAt).toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
