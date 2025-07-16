import NotificationList from "../../features/notifications/NotificationList";
import { Link } from "react-router";
import ConversationList from "../../features/messenger/Conversation/ConversationList/ConversationList";

import { useCurrentUser } from "../../hooks/useUsers";
import { useCallback, useEffect, useState } from "react";
import { AppDispatch } from "../../store/store";
import { markAllRead } from "../../features/notifications/notificationsSlice";
import { useUnreadConversation } from "../../hooks/useConversation";
import { useNavbarBadge } from "../../hooks/navbarBadge/useNavbarBadge.";

interface NotificationProp {
  hasNotification: boolean;
  allIds: string[];
}

interface NavControllProp {
  onPageRefresh: () => Promise<void>;
  dispatch: AppDispatch;
  notificationProp: NotificationProp;
}

const NavControl = ({
  onPageRefresh,

  dispatch,
  notificationProp,
}: NavControllProp) => {
  const { currentUser } = useCurrentUser();
  const isThereUnReadConvo = useUnreadConversation();

  const { hasNotification, allIds: allUnreadNotifId } = notificationProp;

  const { shouldRender: renderNotifBadge, isVisible: visibleNotifBadge } =
    useNavbarBadge(hasNotification);

  const { shouldRender: renderConvoBadge, isVisible: visibleConvoBadge } =
    useNavbarBadge(isThereUnReadConvo);

  useEffect(() => {
    console.log("A convo has been updated");
  }, [isThereUnReadConvo]);

  useEffect(() => {
    const dropdownTrigger = document.getElementById("notification-trigger");

    const handleDropdownHidden = async () => {
      await markReadAllNotification();
    };

    // hidden.bs.dropdown, is a bootstrap event that will be  fired when the
    // dropdown has finished being hidden from the user
    if (dropdownTrigger) {
      dropdownTrigger.addEventListener(
        "hidden.bs.dropdown",
        handleDropdownHidden
      );
    }

    return () => {
      dropdownTrigger?.removeEventListener(
        "hidden.bs.dropdown",
        handleDropdownHidden
      );
    };
  }, [hasNotification]);

  const markReadAllNotification = useCallback(async () => {
    if (hasNotification) {
      await dispatch(markAllRead(allUnreadNotifId));
    }
  }, [dispatch, hasNotification]);

  return (
    <>
      <ul className="navbar-menu">
        <li>
          <span className="material-symbols-outlined " onClick={onPageRefresh}>
            home
          </span>
        </li>

        <li className="chat">
          <div className="dropdown">
            <span
              className="material-symbols-outlined"
              data-bs-toggle="dropdown"
              data-bs-auto-close="outside"
              aria-expanded="false"
            >
              chat
            </span>
            {renderConvoBadge && (
              <span
                className={`message-badge-position icon-badge ${
                  visibleConvoBadge ? "icon-badge--visible" : "icon-badge--gone"
                } `}
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
                aria-expanded="false"
              ></span>
            )}
            <div className="dropdown-menu dropdown-menu-end ">
              <ConversationList currentUser={currentUser} />
            </div>
          </div>
        </li>

        <li className="notifs">
          <div className="dropdown">
            <span
              id="notification-trigger"
              className="material-symbols-outlined"
              data-bs-toggle="dropdown"
              data-bs-auto-close="true"
              aria-expanded="false"
            >
              notifications
            </span>
            {renderNotifBadge && (
              <span
                className={`notif-badge-position icon-badge ${
                  visibleNotifBadge ? "icon-badge--visible" : "icon-badge--gone"
                } `}
                data-bs-toggle="dropdown"
                data-bs-auto-close="true"
                aria-expanded="false"
              ></span>
            )}
            <div
              id="notification-dropdown-menu"
              className="dropdown-menu dropdown-menu-end"
              style={{ padding: "0" }}
            >
              <NotificationList />
            </div>
          </div>
        </li>
        <Link to={"/profile"}>
          <span className="material-symbols-outlined .symbols">person</span>
        </Link>
      </ul>
    </>
  );
};

export default NavControl;
