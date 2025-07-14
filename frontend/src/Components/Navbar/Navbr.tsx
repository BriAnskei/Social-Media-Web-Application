import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import LogoutModal from "../Modal/LogoutModal/LogoutModal";
import { useUnreadNotif } from "../../hooks/useUnreadNotif";
import { markAllRead } from "../../features/notifications/notificationsSlice";
import SuggestionInput from "../SuggestionInput/suggestionInput";
import { FetchedUserType } from "../../types/user";
import { viewProfile } from "../Modal/globalSlice";
import { useCurrentUser } from "../../hooks/useUsers";
import { useLocation } from "react-router";
import { fetchAllPost } from "../../features/posts/postSlice";

import ConversationList from "../../features/messenger/Conversation/ConversationList/ConversationList";
import NotificationList from "../../features/notifications/NotificationList";

const Navbr = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();

  const location = useLocation(); // validating for homepage refresh
  const { nummberOfUnread, allIds } = useUnreadNotif(); // unread notification
  const unreadCount = nummberOfUnread; // Use the actual unread count instead of hardcoded 0

  const [renderBadge, setRenderBadge] = useState(unreadCount > 0);
  const [badgeVisible, setBadgeVisible] = useState(unreadCount > 0);

  const [isNotifViewed, setIsNotifViewed] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const toggleLogout = () => {
    setShowLogout(!showLogout);
  };

  useEffect(() => {
    if (unreadCount > 0) {
      // ► unread appeared ▹ render badge first, then make it visible with delay
      setRenderBadge(true);
      setBadgeVisible(false); // Start hidden

      // Small delay to ensure DOM has rendered, then trigger fade-in
      const fadeInTimer = setTimeout(() => {
        setBadgeVisible(true);
      }, 10); // Very small delay to allow DOM to render

      return () => clearTimeout(fadeInTimer);
    } else {
      console.log("No new notifcation:", unreadCount);
      // ► unread cleared ▹ start fade out, then remove after transition

      const fadeOutTimer = setTimeout(() => {
        setRenderBadge(false);
        setBadgeVisible(false);
      }, 1000); // Match CSS transition duration
      return () => clearTimeout(fadeOutTimer);
    }
  }, [unreadCount]);

  const handleOnSeach = (data: FetchedUserType) => {
    if (data._id === currentUser._id) {
      navigate("/profile");
    } else {
      dispatch(viewProfile(data));
      navigate("/view/profile");
    }
  };

  const onPageRefresh = async () => {
    const { pathname } = location;

    if (pathname === "/") {
      if (window.pageYOffset === 0) {
        await homePageOnFetch();
      } else {
        window.scrollTo(0, 0);
      }
    } else {
      navigate("/");
    }
  };

  const homePageOnFetch = async () => {
    try {
      await dispatch(fetchAllPost());
    } catch (error) {
      console.log("Error refreshing post: ", error);
    }
  };

  const setAllNotifToRead = async () => {
    const isNotifViewed = document
      .getElementById("notification-dropdown")
      ?.classList.contains("show");

    if (isNotifViewed) {
      await dispatch(markAllRead(allIds));
    }
  };

  return (
    <>
      <div className="navbar">
        <div className="logo">
          <span>Social App</span>

          <SuggestionInput onSelect={handleOnSeach} />
        </div>
        <div className="navbar-act">
          <ul className="navbar-menu">
            <li>
              <span
                className="material-symbols-outlined .symbols"
                onClick={onPageRefresh}
              >
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
                <span
                  className="count"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="outside"
                  aria-expanded="false"
                >
                  {unreadCount}
                </span>
                <div className="dropdown-menu dropdown-menu-end ">
                  <ConversationList currentUser={currentUser} />
                </div>
              </div>
            </li>

            <li className="notifs" onClick={() => setAllNotifToRead()}>
              <div className="dropdown">
                <span
                  className="material-symbols-outlined .symbols"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  notifications
                </span>
                {renderBadge && (
                  <span
                    className={`flag ${
                      badgeVisible ? "flag--visible" : "flag--gone"
                    }`}
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                    aria-expanded="false"
                  ></span>
                )}
                <div
                  id="notification-dropdown"
                  className="dropdown-menu dropdown-menu-end"
                  style={{ padding: "0" }}
                >
                  <NotificationList
                    isNotifViewed={isNotifViewed}
                    allUnReadNotifIds={allIds}
                  />
                </div>
              </div>
            </li>
            <Link to={"/profile"}>
              <span className="material-symbols-outlined .symbols">person</span>
            </Link>
          </ul>
          <div className="logout">
            <span onClick={toggleLogout}>Logout</span>
          </div>
        </div>
      </div>
      <LogoutModal showModal={showLogout} onClose={toggleLogout} />
    </>
  );
};

export default Navbr;
