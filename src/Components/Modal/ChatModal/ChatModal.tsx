import ChatList from "../../../features/messenger/ChatList/ChatList";
import "./ChatModal.css";

interface Prop {
  showModal: boolean;
  onClose: () => void;
}

const ChatModal: React.FC<Prop> = ({ showModal, onClose }) => {
  return (
    <>
      <div
        className={`modal fade ${showModal ? "show d-block" : ""}`}
        tabIndex={-1}
      >
        <div className="modal-dialog modal-dialog-scrollable modal-post">
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
