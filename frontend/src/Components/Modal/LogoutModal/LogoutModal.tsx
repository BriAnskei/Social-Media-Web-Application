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

const LogoutModal: React.FC<ModalTypes> = ({ showModal, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { socket } = useContext(SocketContext);

  const handleLogout = (e: any) => {
    e.preventDefault();
    dispatch(logout(), clearData(), resetData());
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
