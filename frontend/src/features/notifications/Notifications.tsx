import "./NotificationList.css";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";

import { useNavigate } from "react-router";
import { viewPost } from "../../Components/Modal/globalSlice";
import { faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NotificationList from "./NotificationList";

const Notifications = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

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

  const listOnClick = (postId: string | undefined, type: string) => {
    if (!type) throw new Error("No type to dispatch this action");

    if (type === "upload" || type === "comment" || type === "like") {
      if (!postId) throw new Error("No postId to dispatch this action");

      dispatch(viewPost(postId));
      navigate("/viewpost");
    }
  };

  return (
    <div className="notif-container">
      <div className="notif-header">
        <FontAwesomeIcon icon={faXTwitter} />
        <span>Notification</span>
      </div>
      <NotificationList
        dispatch={dispatch}
        listOnClick={listOnClick}
        displayLogoType={displayLogoType}
      />
    </div>
  );
};

export default Notifications;
