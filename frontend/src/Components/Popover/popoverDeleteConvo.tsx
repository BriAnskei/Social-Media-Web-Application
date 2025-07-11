import { Button, Overlay, Popover } from "react-bootstrap";
import { PopoverDeleteConvoType } from "./PopOverType";
import { usePopoverContext } from "../../hooks/usePopover";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { deleteConversation } from "../../features/messenger/Conversation/conversationSlice";
import toast from "react-hot-toast";

const PopoverDeleteConvo: React.FC<PopoverDeleteConvoType> = ({
  target,
  show,
  convoId,
}) => {
  const { chatProp } = usePopoverContext();
  const dispatch = useDispatch<AppDispatch>();

  if (!target || !target.current) return null;

  const deletConversation = async () => {
    try {
      await dispatch(deleteConversation(convoId));
    } catch (error) {
      console.error("Failed on handleDeleteConvo, ", error);
    }
  };

  const handleDeleteConvo = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    toast.promise(deletConversation(), {
      loading: "Deleting...",
      success: <b>Conversation deleted!</b>,
      error: <b>Could not save.</b>,
    });
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
                  onClick={(e) => handleDeleteConvo(e)}
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
