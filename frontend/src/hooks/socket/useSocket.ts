import { useDispatch, useSelector } from "react-redux";
import { useCallback, useContext, useEffect, useRef } from "react";
import { SocketContext } from "../../context/SocketContext";
import { getToken } from "../../features/auth/authSlice";
import { RootState } from "../../store/store";
import { LikeHandlerTypes } from "../../types/PostType";
import { postLiked } from "../../features/posts/postSlice";
import { addNotification } from "../../features/notifications/notificationsSlice";

// types/socket.types.ts

interface NotificationType {
  _id: string;
  receiver: string;
  sender: string;
  post: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}

export interface DataOutput {
  isExist: boolean;
  data: NotificationType;
}

export const useSocket = () => {
  const dispatch = useDispatch();
  const { socket, isConnected } = useContext(SocketContext);
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const isInitialized = useRef(false);

  const handleLikeEvent = useCallback(
    (data: LikeHandlerTypes) => {
      dispatch(postLiked(data));
    },
    [dispatch]
  );

  const handleNotification = useCallback((data: DataOutput) => {
    console.log("Notification received:", data);
    dispatch(addNotification(data));
  }, []);

  useEffect(() => {
    if (!accessToken) {
      dispatch(getToken());
      return;
    }

    if (!socket || isInitialized.current) return;

    const setupSocket = () => {
      if (!isConnected) {
        socket.auth = { accessToken };
        socket.connect();
      }

      //  Ensures only one event listener exists per socket event.
      socket.off("postLiked");
      socket.off("likeNotify");

      // Set up event listeners
      socket.on("postLiked", handleLikeEvent);
      socket.on("likeNotify", handleNotification);
      socket.on("error", (error: Error) => {
        console.error("Socket error:", error);
      });

      isInitialized.current = true;
    };

    setupSocket(); // connect

    // Cleanup function
    return () => {
      if (socket) {
        socket.off("postLiked", handleLikeEvent); // used to remove the event triggers wwhen the component unmounts
        socket.off("likeNotify", handleNotification);
        isInitialized.current = false;
      }
    };
  }, [accessToken, socket, isConnected]); // include funtion as

  // Utility functions to emit events
  const emitLike = useCallback(
    (data: { postId: string; postOwnerId: string; userId: string }) => {
      if (socket && isConnected) {
        socket.emit("likePost", data);
      }
    },
    [isConnected]
  );

  const emitComment = useCallback((postId: string, content: string) => {
    if (socket && isConnected) {
      socket.emit("comment", { postId, content });
    }
  }, []);

  return {
    socket,
    isConnected,
    emitLike,
    emitComment,
  };
};
