import React, { useContext } from "react";
import "./LogoutModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { ModalTypes } from "../../../types/modalTypes";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import { logout } from "../../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { clearData } from "../../../features/users/userSlice";
import { resetData } from "../../../features/posts/postSlice";
import { SocketContext } from "../../../context/SocketContext";
import { useSocket } from "../../../hooks/socket/useSocket";
import { resetConvoState } from "../../../features/messenger/Conversation/conversationSlice";
import { resetMessageState } from "../../../features/messenger/Message/messengeSlice";
import { resetGlobalState } from "../globalSlice";

const LogoutModal: React.FC<ModalTypes> = ({ showModal, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { emitCleanUp } = useSocket();
  const { socket } = useContext(SocketContext);

  const handleLogout = (e: any) => {
    e.preventDefault();
    dispatch(logout());
    dispatch(resetData());
    dispatch(clearData());
    dispatch(resetConvoState());
    dispatch(resetMessageState());
    dispatch(resetGlobalState());
    emitCleanUp();
    socket?.disconnect(); // disconnect socket
    navigate("/");
  };

  return (
    <>
      <div
        className={`modal fade ${showModal ? "show d-block" : ""} logout-modal`}
        tabIndex={-1}
      >
        <div className="modal-dialog logout-modal-position">
          <div className="modal-content">
            <div className="modal-header">
              <FontAwesomeIcon icon={faXTwitter} />
              <span>SocioApp</span>
            </div>
            <div className="modal-body">
              <span>Are you sure you want to logout?</span>
              <br />
            </div>
            <div className="modal-footer">
              <span onClick={handleLogout}>Yes</span>

              <span onClick={() => onClose()}>No</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoutModal;
