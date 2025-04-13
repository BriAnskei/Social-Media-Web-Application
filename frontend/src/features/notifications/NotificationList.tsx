import "./NotificationList.css";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useGlobal } from "../../hooks/useModal";
import { useNavigate } from "react-router";

const NotificationList = () => {
  const navigate = useNavigate();

  const { allIds, byId, loading } = useSelector(
    (state: RootState) => state.notification
  );
  const userById = useSelector((state: RootState) => state.user.byId);

  const { postData } = useGlobal();

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
    if (!postId) throw new Error("No post Id to view post");

    if (type === "upload" || type === "comment" || type === "like") {
      postData.viewPost(postId);
      navigate("/viewpost");
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
          const notifData = byId[id];
          const senderId = notifData.sender; // get sender by notif

          const senderData = userById[senderId];

          return (
            <div
              className={`notif-container ${
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
