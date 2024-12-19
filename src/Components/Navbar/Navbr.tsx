import { Link } from "react-router-dom";
import "./Navbar.css";
import { useState } from "react";
import ChatModal from "../Modal/ChatModal/ChatModal";
import NotifModal from "../Modal/NotificationModal/NotifModal";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const Navbr = () => {
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);

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
    console.log("MOdal toggle");
    setShowNotifModal(!showNotifModal);
  };

  return (
    <>
      <div className="navbar">
        <div className="logo">
          <span>Social App</span>
          <input type="text" placeholder="Search PekBok" />
        </div>
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
      </div>
      <NotifModal showModal={showNotifModal} onClose={toggleNotif} />
      <ChatModal showModal={showMessageModal} onClose={toggleChat} />
    </>
  );
};

export default Navbr;
