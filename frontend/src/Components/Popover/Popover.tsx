// PopoverMenu.tsx
import React from "react";
import { Overlay, Popover, Button } from "react-bootstrap";
import { useGlobal } from "../../hooks/useModal";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { toggleDeleteModal, toggleEditModal } from "../Modal/globalSlice";

interface PopoverProp {
  target: React.MutableRefObject<null>;
  show: boolean;
}

const PopoverMenu: React.FC<PopoverProp> = ({ target, show }) => {
  if (!target || !target.current) {
    return;
  }

  const dispatch = useDispatch<AppDispatch>();
  const { popover } = useGlobal();

  const popoverEventMenu = (type: string) => {
    switch (type) {
      case "edit":
        dispatch(toggleEditModal(popover.postId));
        break;
      case "delete":
        dispatch(toggleDeleteModal(popover.postId));
        break;
      default:
        return type;
    }
    popover.popOverClose();
  };

  return (
    <div>
      <Overlay target={target.current} show={show} placement="left">
        {(props: any) => (
          <Popover {...props}>
            <Popover.Body style={{ padding: "10px" }}>
              <div className="d-grid gap-1">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  style={{ height: "1.7rem" }}
                  onClick={() => popoverEventMenu("edit")}
                >
                  Edit post
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  style={{ height: "1.7rem" }}
                  onClick={() => popoverEventMenu("delete")}
                >
                  Delete post
                </Button>
              </div>
            </Popover.Body>
          </Popover>
        )}
      </Overlay>
    </div>
  );
};

export default PopoverMenu;
