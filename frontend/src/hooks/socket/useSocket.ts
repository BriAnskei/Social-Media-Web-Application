import { useDispatch, useSelector } from "react-redux";
import { useCallback, useContext, useEffect, useRef } from "react";
import { SocketContext } from "../../context/SocketContext";
import { getToken } from "../../features/auth/authSlice";
import { RootState } from "../../store/store";
import {
  CommentEventPayload,
  CommentEventRes,
  LikeHandlerTypes,
} from "../../types/PostType";
import { postLiked } from "../../features/posts/postSlice";
import { addLikeNotif } from "../../features/notifications/notificationsSlice";
import { NotificationType } from "../../types/NotificationTypes";

export interface DataOutput {
  // for post-like notification
  isExist: boolean;
  data: NotificationType;
}

export const useSocket = () => {
  const dispatch = useDispatch();
  const { socket, isConnected } = useContext(SocketContext);
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const isInitialized = useRef(false); //  ensure that the socket event listeners (like postLiked, likeNotify) are only set up once, even if the useEffect runs multiple times.
  // flag for the logic, use useRef to not cause a render every update

  // like events function
  const handleLikeEvent = useCallback(
    (data: LikeHandlerTypes) => {
      dispatch(postLiked(data));
    },
    [dispatch]
  );
  // postOwner
  const likeNotifEvents = useCallback((data: DataOutput) => {
    dispatch(addLikeNotif(data));
  }, []);

  // comment events function
  const handleCommentEvent = useCallback(
    (data: CommentEventRes) => {
      console.log("comment event from server(global): ", data);
    },
    [dispatch]
  );

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

      socket.off("postCommented");

      // Set up event listeners

      // Like Events
      // global event
      socket.on("postLiked", handleLikeEvent);
      // owner event
      socket.on("likeNotify", likeNotifEvents);

      // Comment Event
      // global
      socket.on("postCommented", handleCommentEvent);

      socket.on("error", (error: Error) => {
        console.error("Socket error:", error);
      });

      isInitialized.current = true;
    };

    setupSocket(); // connect

    // Cleanup function
    return () => {
      if (socket) {
        socket.off("postLiked", handleLikeEvent);
        socket.off("postLiked", handleLikeEvent); // used to remove the event triggers when the component unmounts
        socket.off("likeNotify", likeNotifEvents);
        isInitialized.current = false;
      }
    };
  }, [accessToken, socket, isConnected]);

  // Utility functions to emit events
  const emitLike = useCallback(
    (data: { postId: string; postOwnerId: string; userId: string }) => {
      console.log(socket, isConnected);

      if (socket && isConnected) {
        socket.emit("likePost", data);
      }
    },
    [isConnected]
  );

  const emitComment = useCallback((data: CommentEventPayload) => {
    console.log("Emting comment: ", data);
    if (socket && isConnected) {
      socket.emit("commentPost", data);
      console.log("Comment succesfully emited");
    } else
      console.log(
        "Socket not connected, connet emit data: ",
        socket,
        isConnected
      );
  }, []);

  return {
    socket,
    isConnected,
    emitLike,
    emitComment,
  };
};
