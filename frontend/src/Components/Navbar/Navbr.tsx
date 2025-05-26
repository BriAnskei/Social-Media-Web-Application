import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useState } from "react";

import NotifModal from "../Modal/NotificationModal/NotifModal";
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

const Navbr = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();

  const location = useLocation(); // validating for homepage refresh
  const { nummberOfUnread, allIds } = useUnreadNotif(); // unread notification
  const unreadCount = 0;

  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const toggleNotif = () => {
    if (showNotifModal) {
      // trigger dispatch only if the model is being closed
      dispatch(markAllRead(allIds));
    }
    setShowNotifModal(!showNotifModal);
  };

  const toggleLogout = () => {
    setShowLogout(!showLogout);
  };

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
                <div className="dropdown-menu dropdown-menu-end">
                  <ConversationList currentUser={currentUser} />
                </div>
              </div>
            </li>
            <li className="notifs" onClick={toggleNotif}>
              <span className="material-symbols-outlined .symbols">
                notifications
              </span>
              {nummberOfUnread !== 0 && (
                <span className="count">{nummberOfUnread}</span>
              )}
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
      <NotifModal showModal={showNotifModal} onClose={toggleNotif} />
    </>
  );
};

export default Navbr;
