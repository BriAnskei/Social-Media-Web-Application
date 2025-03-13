import { useSelector } from "react-redux";
import { selectUnreadNotif } from "../features/notifications/notifSelector";

//  returns the number  of unread notif
export const useUnreadNotif = () => {
  const data = useSelector(selectUnreadNotif);

  return { numberOfUnread: data.length };
};
