import { useDispatch, useSelector } from "react-redux";
import { useCallback, useContext, useEffect, useRef } from "react";
import { SocketContext } from "../../context/SocketContext";
import { getToken } from "../../features/auth/authSlice";
import { AppDispatch, RootState } from "../../store/store";
import { CommentEventPayload, LikeHandlerTypes } from "../../types/PostType";
import { commentOnPost, postLiked } from "../../features/posts/postSlice";
import { addNotification } from "../../features/notifications/notificationsSlice";
import { NotificationType } from "../../types/NotificationTypes";
import { updateFollow } from "../../features/users/userSlice";

export interface DataOutput {
  // for post-like notification
  isExist: boolean;
  data: NotificationType;
}

export const SOCKET_EVENTS = {
  posts: {
    // Like Events
    LIKE_POST: "likePost", // sends by the client
    // sends both by server
    POST_LIKED: "postLiked",
    LIKE_NOTIFY: "likeNotify",

    // comment events
    COMMENT_POST: "commentPost",
    // server
    POST_COMMENTED: "postCommented",
    COMMENT_NOTIF: "commentNotify",

    // post upload
    UPLOAD_POST: "upload-post",

    POST_UPLOADED: "post-uploaded",
  },
};

export const useSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
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

  // comment events function
  const handleCommentEvent = useCallback(
    (data: CommentEventPayload) => {
      dispatch(commentOnPost(data));
    },
    [dispatch]
  );

  // postOwner
  const likeNotifEvents = useCallback((data: DataOutput) => {
    dispatch(addNotification(data));
  }, []);

  const commentNotifEvent = useCallback(
    (data: DataOutput) => {
      dispatch(addNotification(data));
    },
    [dispatch]
  );

  const uploadNotifEvent = useCallback(
    (data: any) => {
      dispatch(addNotification(data));
    },
    [dispatch]
  );

  // user event
  const handleFollowEvent = useCallback(
    (data: { isExist: boolean; data: NotificationType }) => {
      const followPayload = {
        followerId: data.data.sender,
        userId: data.data.receiver,
      };

      dispatch(updateFollow(followPayload));
      dispatch(addNotification(data));
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
      socket.off(SOCKET_EVENTS.posts.COMMENT_NOTIF);

      socket.off("followed-user");
      // uploading event
      socket.off(SOCKET_EVENTS.posts.UPLOAD_POST);

      // global event
      socket.on("postLiked", handleLikeEvent);
      socket.on("postCommented", handleCommentEvent);

      // owner event
      socket.on("likeNotify", likeNotifEvents);
      socket.on(SOCKET_EVENTS.posts.COMMENT_NOTIF, commentNotifEvent);

      // FollowEvent
      socket.on("followed-user", handleFollowEvent);

      socket.on(SOCKET_EVENTS.posts.UPLOAD_POST, uploadNotifEvent);

      socket.on("error", (error: Error) => {
        console.error("Socket error:", error);
      });

      isInitialized.current = true;
    };

    setupSocket(); // connect

    // Cleanup function
    return () => {
      if (socket) {
        socket.off("postLiked", handleLikeEvent); // used to remove the event triggers when the component unmounts
        socket.off("likeNotify", likeNotifEvents);

        socket.off("postCommented");
        socket.off(SOCKET_EVENTS.posts.COMMENT_NOTIF);

        socket.off("followed-user", handleFollowEvent);
        socket.off(SOCKET_EVENTS.posts.UPLOAD_POST, uploadNotifEvent);

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
    [isConnected, socket]
  );

  const emitComment = useCallback(
    (data: CommentEventPayload) => {
      if (socket && isConnected) {
        socket.emit("commentPost", data);
      }
    },
    [socket, isConnected]
  );

  const emitFollow = useCallback(
    (data: any) => {
      if (socket && isConnected) {
        console.log("sending emit");

        socket.emit("user-follow", data);
      } else {
        console.log("faild to send, socket not connected", socket, isConnected);
      }
    },
    [socket, isConnected]
  );

  const emitUpload = useCallback(
    (data: any) => {
      if (socket && isConnected) {
        console.log("emiting post event");
        socket.emit(SOCKET_EVENTS.posts.POST_UPLOADED, data);
      } else {
        console.log("ERROR user not conntected");
      }
    },
    [socket, isConnected]
  );

  return {
    socket,
    isConnected,
    emitLike,
    emitComment,
    emitFollow,
    emitUpload,
  };
};
