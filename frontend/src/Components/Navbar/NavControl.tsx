import Notifications from "../../features/notifications/Notifications";
import { Link } from "react-router";
import ConversationList from "../../features/messenger/Conversation/ConversationList/ConversationList";

import { useCurrentUser } from "../../hooks/useUsers";
import { useCallback, useEffect, useState } from "react";
import { AppDispatch } from "../../store/store";
import { markAllRead } from "../../features/notifications/notificationsSlice";
import { useUnreadConversation } from "../../hooks/useConversation";
import { useNavbarBadge } from "../../hooks/navbarBadge/useNavbarBadge.";
import {
  fetchAllContact,
  resetContact,
} from "../../features/messenger/Contact/ContactSlice";

interface NotificationProp {
  hasNotification: boolean;
  allIds: string[];
}

interface NavControllProp {
  onPageRefresh: () => Promise<void>;
  onUserPageRefresh: () => void;
  dispatch: AppDispatch;
  notificationProp: NotificationProp;
}

const NavControl = ({
  onPageRefresh,
  onUserPageRefresh,
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

  const [isDropDownShown, setIsDropDownShown] = useState(false);

  dropDownHanlder(setIsDropDownShown, dispatch);

  unreadNotificationHanlder(hasNotification, dispatch, allUnreadNotifId);

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
            <div
              id="convoDropdown"
              className="dropdown-menu dropdown-menu-end "
            >
              <ConversationList
                isDropDownShown={isDropDownShown}
                currentUser={currentUser}
              />
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
              <Notifications />
            </div>
          </div>
        </li>
        <Link to={"/profile"} onClick={onUserPageRefresh}>
          <span className="material-symbols-outlined .symbols">person</span>
        </Link>
      </ul>
    </>
  );
};

export default NavControl;
function dropDownHanlder(
  setIsDropDownShown: (b: boolean) => void,
  dispatch: AppDispatch
) {
  useEffect(() => {
    // Get the dropdown wrapper instead of the menu
    const dropdownWrapper = document.querySelector(".chat .dropdown");

    if (!dropdownWrapper) return;

    const handleShow = () => setIsDropDownShown(true);
    const handleHide = () => {
      setIsDropDownShown(false);
      dispatch(resetContact());

      // initial fetch
      dispatch(fetchAllContact({}));
    };

    dropdownWrapper.addEventListener("shown.bs.dropdown", handleShow);
    dropdownWrapper.addEventListener("hidden.bs.dropdown", handleHide);

    return () => {
      dropdownWrapper.removeEventListener("shown.bs.dropdown", handleShow);
      dropdownWrapper.removeEventListener("hidden.bs.dropdown", handleHide);
    };
  }, []);
}

function unreadNotificationHanlder(
  hasNotification: boolean,
  dispatch: AppDispatch,
  allUnreadNotifId: string[]
) {
  const markReadAllNotification = useCallback(async () => {
    if (hasNotification) {
      await dispatch(markAllRead(allUnreadNotifId));
    }
  }, [dispatch, hasNotification, allUnreadNotifId]);

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
  }, [markReadAllNotification]);
}
