import ChatList from "../../../features/messenger/ChatList/ChatList";
import { ModalTypes } from "../../../types/modalTypes";
import "./ChatModal.css";

const ChatModal: React.FC<ModalTypes> = ({ showModal, onClose }) => {
  return (
    <>
      <div
        className={`modal fade ${showModal ? "show d-block" : ""}`}
        tabIndex={-1}
      >
        <div className="modal-dialog modal-dialog-scrollable chat-modal-position">
          <div className="modal-content content">
            <div className="modal-header chat-header">
              <div className="chat-logo">
                <span>Chats</span>
                <input type="text" placeholder="Search Chat" />
              </div>

              <div className="chatt-close">
                <span onClick={() => onClose()}>X</span>
              </div>
            </div>
            <div className="modal-body body">
              <ChatList />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatModal;
