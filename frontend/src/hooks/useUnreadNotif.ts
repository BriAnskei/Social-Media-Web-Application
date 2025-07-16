import { useSelector } from "react-redux";
import { selectUnreadNotif } from "../features/notifications/notifSelector";

//  returns the number  of unread notif
export const useUnreadNotif = (): {
  hasNotification: boolean;
  allIds: string[];
} => {
  const data = useSelector(selectUnreadNotif);

  return { hasNotification: data.length > 0, allIds: data };
};
