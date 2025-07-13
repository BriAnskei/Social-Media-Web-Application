import { Button, Overlay, Popover } from "react-bootstrap";
import { PopoverDeleteConvoType } from "./PopOverType";
import { usePopoverContext } from "../../hooks/usePopover";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { deleteConversation } from "../../features/messenger/Conversation/conversationSlice";
import toast from "react-hot-toast";
import { useToastEffect } from "../../hooks/toast/useToastEffect";

const PopoverDeleteConvo: React.FC<PopoverDeleteConvoType> = ({
  target,
  show,
  convoId,
}) => {
  const { chatProp } = usePopoverContext();
  const { handleDeleteEffect } = useToastEffect();
  const dispatch = useDispatch<AppDispatch>();

  if (!target || !target.current) return null;

  const deletConversation = async (e: any) => {
    try {
      e.stopPropagation();
      e.preventDefault();
      await handleDeleteEffect(convoId);
    } catch (error) {
      console.error("Failed on handleDeleteConvo, ", error);
    }
  };

  const handleMouseLeave = () => {
    chatProp.deleteConvoToggle({ ref: target, convoId });
  };

  return (
    <div>
      <Overlay target={target.current} show={show} placement="right">
        {(props: any) => (
          <Popover {...props} onMouseLeave={handleMouseLeave}>
            <Popover.Body>
              <div className="d-grid gap-1">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  style={{ height: "1.7rem" }}
                  onClick={(e) => deletConversation(e)}
                >
                  Delete
                </Button>
              </div>
            </Popover.Body>
          </Popover>
        )}
      </Overlay>
    </div>
  );
};

export default PopoverDeleteConvo;
