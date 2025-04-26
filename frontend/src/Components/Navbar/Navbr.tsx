import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useEffect, useState } from "react";
import ChatModal from "../Modal/ChatModal/ChatModal";
import NotifModal from "../Modal/NotificationModal/NotifModal";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import LogoutModal from "../Modal/LogoutModal/LogoutModal";
import { useUnreadNotif } from "../../hooks/useUnreadNotif";
import { markAllRead } from "../../features/notifications/notificationsSlice";
import SuggestionInput from "../SuggestionInput/suggestionInput";
import { FetchedUserType } from "../../types/user";
import { viewProfile } from "../Modal/globalSlice";
import { useCurrentUser } from "../../hooks/useUsers";
import { useLocation } from "react-router";
import { fetchAllPost } from "../../features/posts/postSlice";
import { useGlobal } from "../../hooks/useModal";

const Navbr = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const { postListScroll } = useGlobal();

  const location = useLocation(); // validating for homepage refresh
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const { nummberOfUnread, allIds } = useUnreadNotif(); // unread notification

  const numberOfChants = useSelector(
    (state: RootState) => state.chats.chats.length
  );

  const toggleChat = () => {
    setShowMessageModal(!showMessageModal);
  };

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

            <li className="chat" onClick={toggleChat}>
              <span className="material-symbols-outlined">chat</span>
              <span className="count">{numberOfChants}</span>
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
      <ChatModal showModal={showMessageModal} onClose={toggleChat} />
    </>
  );
};

export default Navbr;
