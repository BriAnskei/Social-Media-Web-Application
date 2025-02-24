import { useDispatch, useSelector } from "react-redux";
import { useCallback, useContext, useEffect, useRef } from "react";
import { SocketContext } from "../../context/SocketContext";
import { getToken } from "../../features/auth/authSlice";
import { RootState } from "../../store/store";
import { LikeHandlerTypes } from "../../types/PostType";
import { postLiked } from "../../features/posts/postSlice";

// types/socket.types.ts

export interface NotificationType {
  postId: string;
  userId: string;
  type: "like" | "comment" | "follow";
  message: string;
}

export const useSocket = () => {
  const dispatch = useDispatch();
  const { socket, isConnected } = useContext(SocketContext);
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const isInitialized = useRef(false);

  const handleLikeEvent = useCallback((data: LikeHandlerTypes) => {
    console.log("like event triggered: ", data);

    dispatch(postLiked(data));
  }, []);

  const handleNotification = useCallback((data: NotificationType) => {
    console.log("Notification received:", data);
    // Handle notification (e.g., show toast, update notifications state)
  }, []);

  useEffect(() => {
    if (!accessToken) {
      dispatch(getToken());
      return;
    }

    if (!socket || isInitialized.current) return;

    const setupSocket = () => {
      console.log("attempting to connect to socket");

      if (!isConnected) {
        socket.auth = { accessToken };
        socket.connect();
      }

      // Set up event listeners
      socket.off("postLiked"); //  Ensures only one event listener exists per socket event.

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

  useEffect(() => {
    console.log("Connection bool: ", isConnected);
  }, [isConnected]);

  // Utility functions to emit events
  const emitLike = useCallback(
    (data: { postId: string; postOwnerId: string; userId: string }) => {
      if (socket && isConnected) {
        console.log("like post emited");

        socket.emit("likePost", data);
      } else {
        console.log("cannot emit, socket invalid", socket, isConnected);
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
