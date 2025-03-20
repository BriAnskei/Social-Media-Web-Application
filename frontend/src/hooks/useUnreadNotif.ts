import { useSelector } from "react-redux";
import { selectUnreadNotif } from "../features/notifications/notifSelector";

//  returns the number  of unread notif
export const useUnreadNotif = (): { unreadNotifLength: number } => {
  const data = useSelector(selectUnreadNotif);

  return { unreadNotifLength: data.length };
};
