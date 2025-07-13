import { useDispatch, useSelector } from "react-redux";
import { useCallback, useContext, useEffect, useRef } from "react";
import { SocketContext } from "../../context/SocketContext";
import { getToken } from "../../features/auth/authSlice";
import { AppDispatch, RootState } from "../../store/store";
import {
  CommentEventPayload,
  FetchPostType,
  LikeHandlerTypes,
} from "../../types/PostType";
import {
  commentOnPost,
  dropPost,
  postLiked,
  update,
} from "../../features/posts/postSlice";
import {
  addOrDropNotification,
  deleteList,
} from "../../features/notifications/notificationsSlice";
import { NotificationType } from "../../types/NotificationTypes";
import { updateFollow } from "../../features/users/userSlice";
import {
  createOrUpdateContact,
  deleteContact,
} from "../../features/messenger/Contact/ContactSlice";
import {
  setConvoToInvalid,
  setConvoToValid,
} from "../../features/messenger/Conversation/conversationSlice";
import { ContactType } from "../../types/contactType";
import { useChatSocket } from "./useChatSocket";
import { useWindowedConversation } from "../useConversation";

export interface DataOutput {
  // for post-like notification
  isExist: boolean;
  data: NotificationType;
}

interface DropChatPayload {
  contactId: string;
  userId: string;
  convoId?: string;
}

interface RefreshContactPayload {
  contact: ContactType;
  userId: string;
  convoId?: string;
}

// post update
export interface PostUpdateEvent {
  data: FetchPostType; // new data updated
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

    // postUpdate
    POST_ON_UPDATE: "post-update",
    POST_UPDATE: "post-updated",

    // Delete Event
    POST_DELETED: "post-deleted",
    POST_DELETE: "post-delete",
  },

  coversation: {
    CREATE_OR_UPDATE_CONTACT: "createdOrUpdated-contact",
    UPDATE_OR_DROP_CONTACT: "updatedOrDroped-contact",
  },
};

export const useSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const convoIdOnChatWindows = useWindowedConversation();
  const { socket, isConnected } = useContext(SocketContext);
  const { accessToken } = useSelector((state: RootState) => state.auth);
  useChatSocket();

  const isInitialized = useRef(false); //  ensure that the socket event listeners (like postLiked, likeNotify) are only set up once, even if the useEffect runs multiple times.

  // like events function
  const handleLikeEvent = useCallback(
    (data: LikeHandlerTypes) => dispatch(postLiked(data)),
    [dispatch]
  );

  // comment events function
  const handleCommentEvent = useCallback(
    (data: CommentEventPayload) => {
      dispatch(commentOnPost(data));
    },
    [dispatch]
  );

  // updated post event
  const handlePostUpdateEvent = useCallback(
    (data: PostUpdateEvent) => {
      dispatch(update(data.data));
    },
    [dispatch]
  );

  const handlePostDelete = useCallback(
    (postId: string) => {
      dispatch(dropPost(postId));
      dispatch(deleteList(postId)); // delete the notification list of other users
    },
    [dispatch]
  );

  // postOwner, and notification
  const likeNotifEvents = useCallback((data: DataOutput) => {
    dispatch(addOrDropNotification(data));
  }, []);

  const commentNotifEvent = useCallback(
    (data: DataOutput) => {
      dispatch(addOrDropNotification(data));
    },
    [dispatch]
  );

  const uploadNotifEvent = useCallback(
    (data: any) => {
      dispatch(addOrDropNotification(data));
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
      dispatch(addOrDropNotification(data));
    },
    [dispatch]
  );

  // state update of convo and contacts for current user
  const handleCreateOrUpdateContact = useCallback(
    (data: RefreshContactPayload) => {
      dispatch(createOrUpdateContact(data));
      dispatch(setConvoToValid(data.convoId));
    },
    [dispatch]
  );

  const handleUpdateOrDropContact = useCallback(
    (data: DropChatPayload) => {
      dispatch(deleteContact(data));
      dispatch(setConvoToInvalid(data.convoId));
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

      const removeAllListener = () => {
        socket.off(SOCKET_EVENTS.posts.POST_UPDATE);

        //delete event
        socket.off(SOCKET_EVENTS.posts.POST_DELETE);

        socket.off("postLiked");
        socket.off("likeNotify");

        socket.off("postCommented");
        socket.off(SOCKET_EVENTS.posts.COMMENT_NOTIF);

        socket.off("followed-user");
        // uploading event
        socket.off(SOCKET_EVENTS.posts.UPLOAD_POST);

        // contact, conversation events
        socket.off(SOCKET_EVENTS.coversation.CREATE_OR_UPDATE_CONTACT);
        socket.off(SOCKET_EVENTS.coversation.UPDATE_OR_DROP_CONTACT);
      };

      removeAllListener();

      socket.onAny((e, ...args) => {
        console.log(`Received in  global handler event: ${e}`, args);
      });

      // global event
      socket.on("postLiked", handleLikeEvent);
      socket.on("postCommented", handleCommentEvent);
      socket.on(SOCKET_EVENTS.posts.POST_UPDATE, handlePostUpdateEvent);

      // owner event
      socket.on("likeNotify", likeNotifEvents);
      socket.on(SOCKET_EVENTS.posts.COMMENT_NOTIF, commentNotifEvent);

      // FollowEvent
      socket.on("followed-user", handleFollowEvent);

      socket.on(SOCKET_EVENTS.posts.UPLOAD_POST, uploadNotifEvent);

      //delete post  event
      socket.on(SOCKET_EVENTS.posts.POST_DELETE, handlePostDelete);

      // contact, conversation events
      socket.on(
        SOCKET_EVENTS.coversation.CREATE_OR_UPDATE_CONTACT,
        handleCreateOrUpdateContact
      );

      socket.on(
        SOCKET_EVENTS.coversation.UPDATE_OR_DROP_CONTACT,
        handleUpdateOrDropContact
      );

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

        // post update
        socket.off(SOCKET_EVENTS.posts.POST_UPDATE, handlePostUpdateEvent);

        // post delete
        socket.off(SOCKET_EVENTS.posts.POST_DELETE, handlePostDelete);

        socket.off("followed-user", handleFollowEvent);
        socket.off(SOCKET_EVENTS.posts.UPLOAD_POST, uploadNotifEvent);

        socket.off(
          SOCKET_EVENTS.coversation.CREATE_OR_UPDATE_CONTACT,
          handleCreateOrUpdateContact
        );

        socket.off(
          SOCKET_EVENTS.coversation.UPDATE_OR_DROP_CONTACT,
          handleUpdateOrDropContact
        );

        isInitialized.current = false;
      }
    };
  }, [accessToken, socket, isConnected]);

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
        socket.emit("user-follow", data);
      } else {
        console.log(
          "failed to send, socket not connected",
          socket,
          isConnected
        );
      }
    },
    [socket, isConnected]
  );

  const emitUpload = useCallback(
    (data: any) => {
      if (socket && isConnected) {
        socket.emit(SOCKET_EVENTS.posts.POST_UPLOADED, data);
      }
    },
    [socket, isConnected]
  );

  // emiting post update
  const emitPostUpdate = useCallback(
    (data: PostUpdateEvent) => {
      if (socket && isConnected) {
        socket.emit(SOCKET_EVENTS.posts.POST_ON_UPDATE, data);
      }
    },
    [socket, isConnected]
  );

  const emitPostDelete = useCallback(
    (data: string) => {
      if (socket && isConnected) {
        socket.emit(SOCKET_EVENTS.posts.POST_DELETED, data);
      }
    },
    [socket, isConnected]
  );

  const emitCleanUp = useCallback(() => {
    if (socket && isConnected) {
      socket.emit("user-leaving", convoIdOnChatWindows);
    }
  }, [socket, isConnected, convoIdOnChatWindows]);

  return {
    socket,
    isConnected,
    emitUpload,
    emitPostUpdate,
    emitPostDelete,
    emitLike,
    emitComment,
    emitFollow,
    emitCleanUp,
  };
};
