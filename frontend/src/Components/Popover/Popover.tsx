// PopoverMenu.tsx
import React, { useEffect, useRef, useState } from "react";
import { Overlay, Popover, Button } from "react-bootstrap";
import { useGlobal } from "../../hooks/useModal";

interface PopoverProp {
  target: React.MutableRefObject<null>;
  show: boolean;
}

const PopoverMenu: React.FC<PopoverProp> = ({ target, show }) => {
  const { popover } = useGlobal();

  useEffect(() => {
    console.log(popover.postId);
  }, [popover]);
  if (!target) return;

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
                  onClick={() =>
                    popover.popoverEventMenu(popover.postId, "edit")
                  }
                >
                  Edit post
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  style={{ height: "1.7rem" }}
                  onClick={() =>
                    popover.popoverEventMenu(popover.postId, "delete")
                  }
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
