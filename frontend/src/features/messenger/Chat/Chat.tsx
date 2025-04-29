import { Overlay, Popover } from "react-bootstrap";

import { ModalTypes } from "../../../types/modalTypes";
import "./Chat.css";

interface ChatProp {
  target: React.MutableRefObject<null>;
  show: boolean;
}

const Chat: React.FC<ChatProp> = ({ target, show }) => {
  console.log(target, show);

  if (!target || !target.current) {
    return;
  }

  return (
    <>
      <Overlay target={target.current} show={show} placement="left">
        {(props: any) => (
          <Popover {...props}>
            <Popover.Body>
              <div className="chat-list-container">asd</div>
            </Popover.Body>
          </Popover>
        )}
      </Overlay>
    </>
  );
};

export default Chat;
