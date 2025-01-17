import { Link } from "react-router-dom";
import "./Navbar.css";
import { useState } from "react";
import ChatModal from "../Modal/ChatModal/ChatModal";
import NotifModal from "../Modal/NotificationModal/NotifModal";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import LogoutModal from "../Modal/LogoutModal/LogoutModal";

const Navbr = () => {
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const numberOfChants = useSelector(
    (state: RootState) => state.chats.chats.length
  );
  const numberOfNotif = useSelector(
    (state: RootState) => state.notification.notification.length
  );

  const toggleChat = () => {
    setShowMessageModal(!showMessageModal);
  };

  const toggleNotif = () => {
    setShowNotifModal(!showNotifModal);
  };

  const toggleLogout = () => {
    setShowLogout(!showLogout);
  };

  return (
    <>
      <div className="navbar">
        <div className="logo">
          <span>Social App</span>
          <input type="text" placeholder="Search PekBok" />
        </div>
        <div className="navbar-act">
          <ul className="navbar-menu">
            <Link to={"/"}>
              <span className="material-symbols-outlined .symbols">home</span>
            </Link>
            <li className="chat" onClick={toggleChat}>
              <span className="material-symbols-outlined">chat</span>
              <span className="count">{numberOfChants}</span>
            </li>
            <li className="notifs" onClick={toggleNotif}>
              <span className="material-symbols-outlined .symbols">
                notifications
              </span>
              <span className="count">{numberOfNotif}</span>
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
