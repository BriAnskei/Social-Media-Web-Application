import { Server, Socket } from "socket.io"; // Socket.io server class, which manages WebSocket connections.
import { Server as HttpServer } from "http"; // http server module from node.js
import { verifyToken } from "../../middleware/auth";

import { NotifData, saveCommentNotif } from "../../controllers/notifController";

import mongoose from "mongoose";
import notificationModel, {
  INotification,
} from "../../models/notificationModel";

import {
  CommentEventPayload,
  LikeEventPayload,
  PostUpdateEvent,
  PostUploadNotifEvent,
} from "../EventsTypes/PostEvents";
import { FollowEvent } from "../EventsTypes/UserEvents";
import { notifService } from "../../services/notification.service";
import { MessageHanlder } from "./messageHanlder";
import { redisEvents } from "../../events/redisEvents";
import { userService } from "../../services/user.service";
import { postService } from "../../services/post.service";
import { IUser } from "../../models/userModel";
import {
  CommentRequestPayload,
  commentService,
} from "../../services/comment.service";
import e from "express";

interface ConnectedUser {
  userId: string;
  socketId: string;
  username?: string;
}

// Define events
const SOCKET_EVENTS = {
  posts: {
    // uploading post
    POST_CREATED: "post-created",
    POST_UPLOAD: "upload-post",

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

    // postUpdate
    POST_ON_UPDATE: "post-update",
    POST_UPDATE: "post-updated",

    // Delete Event
    POST_DELETED: "post-deleted",
    POST_DELETE: "post-delete",
  },

  user: {
    // Follow Events
    USER_FOLLOW: "user-follow",
    //server
    FOLLOWED_USER: "followed-user",
  },

  notification: {
    POST_UPLOADED: "post-uploaded",
    UPLOAD_POST: "upload-post",
  },
};

export class SocketServer {
  private io: Server;
  private connectedUSers: Map<string, ConnectedUser> = new Map();
  private serverEventListeberInitialized = false;

  public messagetHandler: MessageHanlder;

  // https://chatgpt.com/c/67cd8457-6eb0-8012-a2a5-c81d87368d1f
  // .on(event, callback)	Listens for a specific event from the client.
  // .to(socketId).emit(event, data)	Sends an event only to a specific client using their socketId.

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      // Create the server instance bound to node.js server module
      cors: {
        origin: "http://localhost:5174",
        methods: ["GET", "POST"], // allowed methods
      },

      pingTimeout: 60000, // Close connection if client doesn't respond to ping within 60s
      pingInterval: 25000, // Send ping every 25s
    });

    this.messagetHandler = new MessageHanlder(this.io, this);

    this.initializeServer();
  }

  private async initializeServer(): Promise<void> {
    try {
      await this.setUpMiddleware();
      this.setUpRedisEventListeners();
      this.setupEventHandlers();
    } catch (error) {
      console.log("Failed to initialize socket server: ", error);
    }
  }

  // this function run independently for each connection attemp in the client
  private async setUpMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        // this asyncfuntion will run before the clients connects
        const token = socket.handshake.auth.accessToken; // extracts the token from the initial(handshake) req from the client

        if (!token) return next(new Error("No Token provided"));

        const decoded = await verifyToken(token);

        if (!decoded?.userId) {
          return next(new Error("Invalid Token")); // if token is invalid,  the connection process is halted.
          //The error is sent back to the client, which will receive an "error" event on its end(which hold the connect_error event).
        }

        socket.data.userId = decoded?.userId; // stores the token in the socketData
        next();
      } catch (error) {
        next(new Error("Authentication Error"));
      }
    });
  }

  private setUpRedisEventListeners() {
    // Listen for message events from worker via Redis
    redisEvents.on("app_message_on_sent", (data) => {
      console.log("🔥 Redis event received in socket handler:", data);
      this.messagetHandler.sentMessageGlobal(data);
    });

    redisEvents.on("createOrUpdate-contact", (data: any) => {
      this.handleCreateOrUpdateContact(data);
    });

    redisEvents.on("updateOrDrop-contact", (data: any) => {
      this.handleUpdateOrDropContact(data);
    });

    // post evemts
    redisEvents.on("post-like", (data: any) => {
      this.handleLikePost(data);
    });

    redisEvents.on("newNotification", (data: any) => {
      this.handleCommentNotification(data);
    });
  }

  private setupEventHandlers() {
    // emplmenting events of tha users that are in the connection room
    this.io.on("connection", (socket) => {
      this.handleConnection(socket); // register the user as connected(online) first
      this.messagetHandler.registerEvents(socket);

      // Handle Error
      socket.on("error", (error) => {
        console.error("Socket Server Error", error);
        socket.emit("error", "An error occured");
      });

      socket.on("user-leaving", (convoIds: string[]) => {
        this.messagetHandler.cleanUpOnLeave({ socket, convoIds });
      });

      socket.on("disconnect", () => this.handleDisconnection(socket));

      socket.on(SOCKET_EVENTS.posts.POST_CREATED, (data: any) => {
        this.handlePostUploadEvent(socket, data);
      });

      // user event
      socket.on(SOCKET_EVENTS.user.USER_FOLLOW, (data: FollowEvent) => {
        this.handleFollowEvent(socket, data);
      });

      // post notfication
      socket.on(
        SOCKET_EVENTS.notification.POST_UPLOADED,
        (data: PostUploadNotifEvent) => {
          this.handlePostUploadEvent(socket, data);
        }
      );

      // on post update
      socket.on(SOCKET_EVENTS.posts.POST_ON_UPDATE, (data: PostUpdateEvent) => {
        this.postUpdateEvent(socket, data);
      });

      // on post delete
      socket.on(SOCKET_EVENTS.posts.POST_DELETED, (data: string) => {
        this.handlePostDeleteEvent(socket, data);
      });

      // comment on post
      socket.on(
        SOCKET_EVENTS.posts.COMMENT_POST,
        (data: CommentRequestPayload) => {
          this.handleNewCommentEvent(socket, data);
        }
      );
    });
  }

  public getConnectedUser(userId: string): ConnectedUser {
    const socketData = this.connectedUSers.get(userId);

    if (!socketData)
      throw new Error("getConnectedUser, Error: Cannot find socket data");
    return socketData;
  }

  private async handleNewCommentEvent(
    socket: Socket,
    payLoad: CommentRequestPayload
  ) {
    try {
      const boadcastPayload = {
        user: payLoad.user,
        postId: payLoad.post.postId,
        content: payLoad.content,
        createAt: payLoad.createdAt,
      };
      socket.broadcast.emit("postComment", boadcastPayload);

      await commentService.addComment(payLoad);
    } catch (error) {
      console.log("Failed on handleNewCommentEvent", error);
    }
  }

  private handleConnection(socket: any): void {
    try {
      const user: ConnectedUser = {
        userId: socket.data.userId,
        socketId: socket.id,
      };

      this.connectedUSers.set(socket.data.userId, user);
      console.log(`a user just connect: ${socket.data.userId}:`);
      console.log(
        "all connected users: ",
        JSON.stringify(Object.fromEntries(this.connectedUSers))
      );
    } catch (error) {
      console.error("Error handling connection: ", error);
    }
  }

  private handleDisconnection(socket: any): void {
    try {
      this.connectedUSers.delete(socket.data.userId);
      console.log(`User Disconnected: ${socket.data.userId}`);

      console.log(
        "all connected users: ",
        JSON.stringify(Object.fromEntries(this.connectedUSers))
      );

      this.broadcastOnlineUsers();
    } catch (error) {
      console.log("Error handling disconnection");
    }
  }

  // Post Events
  private async handleLikePost(
    data: LikeEventPayload,
    socket?: any
  ): Promise<void> {
    const { userId, postOwnerId, postId, notifData } = data;
    try {
      this.emitLikeEventGlobally(userId, postOwnerId, postId);

      const ownerSocket = this.getConnectedUser(postOwnerId);

      // only sent an emit  to the owwner if the notif data is initialize
      // this means that the liker is not the owner
      if (notifData) {
        this.io
          .to(ownerSocket.socketId)
          .emit(SOCKET_EVENTS.posts.LIKE_NOTIFY, notifData);
      }
    } catch (error) {
      console.error("Error handling post like:", error);
    }
  }

  private emitLikeEventGlobally(
    userId: string,
    postOwnerId: string,
    postId: string
  ) {
    try {
      const senderSocket = this.getConnectedUser(userId);

      const socket = this.getUserSocketInstance(senderSocket.socketId);

      // boadcast to all users (that is in the room in cluding the owner) except the sender
      socket.broadcast.emit(SOCKET_EVENTS.posts.POST_LIKED, {
        // this will only increase the # of likes in the ui of other online users using reducer function in slice
        userId,
        postOwnerId,
        postId,
      });
    } catch (error) {
      console.error("emitLikeEventGlobally, ", error);
    }
  }

  private getUserSocketInstance(socketId: string): Socket<any> {
    try {
      const socketIntance = this.io.sockets.sockets.get(socketId);

      if (!socketIntance)
        throw new Error(
          "getUserSocketInstance, Error: Cannot find socket instance"
        );

      return socketIntance;
    } catch (error) {
      throw new Error("getUserSocketInstance " + (error as Error));
    }
  }
  private async handleCommentNotification(
    config: INotification
  ): Promise<void> {
    if (this.isUserOnline(config.receiver.toString())) {
      this.io.to(config.receiver.toString()).emit("newCommentNotify", config);
    }
  }

  public isUserOnline(userId: string): boolean {
    return this.connectedUSers.has(userId);
  }

  // Notify followers, whne uploading a post
  private async handlePostUploadEvent(socket: any, data: any): Promise<void> {
    try {
      const { userId, postId } = data;

      const usersFollowers = await userService.getUsersFolowers(userId);

      if (!usersFollowers || usersFollowers.length === 0) return;

      // Safe Batch Insert Handling
      const batchSize = 1000;
      const totalFollowers = usersFollowers.length;

      for (let i = 0; i < totalFollowers; i += batchSize) {
        const followersBatch = usersFollowers.slice(i, i + batchSize);

        // Create bulk notifications in database
        const bulkNotifications = followersBatch.map((followerId) => ({
          receiver: followerId,
          sender: mongoose.Types.ObjectId.createFromHexString(userId),
          post: mongoose.Types.ObjectId.createFromHexString(postId),
          message: "uploaded a new post",
          type: "upload",
        }));

        const response = await notificationModel.insertMany(bulkNotifications);

        for (let i = 0; i < followersBatch.length; i++) {
          const followerId = followersBatch[i];
          const followerSocket = this.connectedUSers.get(followerId.toString());

          if (followerSocket) {
            console.log("sending data to follower: ", followerSocket);

            const notifData = { isExist: false, data: response[i] };
            this.io
              .to(followerSocket.socketId)
              .emit(SOCKET_EVENTS.notification.UPLOAD_POST, notifData);
          }
        }
      }
    } catch (error) {
      console.error("Error handling post upload event: ", error);
      socket.emit("error", "Failed to process post upload notifications");
    }
  }

  private async postUpdateEvent(
    socket: any,
    data: PostUpdateEvent
  ): Promise<void> {
    try {
      socket.broadcast.emit(SOCKET_EVENTS.posts.POST_UPDATE, data);
    } catch (error) {
      console.log("Error emiting updated post data: ", error);
    }
  }

  // User Events
  private async handleFollowEvent(
    socket: any,
    data: { followerId: string; followingName: string; userId: string }
  ): Promise<void> {
    try {
      const { followerId, userId } = data;

      const followEventPayload: NotifData = {
        receiver: userId,
        sender: followerId,
        message: "started following you",
        type: "follow",
      };

      const notifData = await notifService.AddOrDropFollowNotif(
        followEventPayload
      );

      const ownerSocket = this.connectedUSers.get(userId);
      if (ownerSocket) {
        this.io
          .to(ownerSocket.socketId)
          .emit(SOCKET_EVENTS.user.FOLLOWED_USER, notifData);
      }
    } catch (error) {
      console.error(error);
      socket.emit("error", "Failed to process comment action");
    }
  }

  private async handlePostDeleteEvent(
    socket: any,
    postId: string
  ): Promise<void> {
    try {
      // Delete like, comment notification for this
      socket.broadcast.emit(SOCKET_EVENTS.posts.POST_DELETE, postId);
    } catch (error) {
      console.error("Failed to broadcast delete post: ", error);
    }
  }

  // conversation, contact events
  private async handleCreateOrUpdateContact(data: any): Promise<void> {
    try {
      const { userId } = data;
      const socketOwner = this.connectedUSers.get(userId);
      if (!socketOwner) {
        throw new Error(
          "Failed to emit Contact Data: user is not register as online"
        );
      }

      this.io.to(socketOwner.socketId).emit("createdOrUpdated-contact", data);
    } catch (error) {
      console.log("Failed to emit contact(create or update), ", error);
    }
  }

  private async handleUpdateOrDropContact(data: any): Promise<void> {
    try {
      const { userId } = data;
      const socketOwner = this.connectedUSers.get(userId);
      if (!socketOwner) {
        throw new Error(
          "Failed to emit Contact Data: user is not register as online"
        );
      }

      this.io.to(socketOwner.socketId).emit("updatedOrDroped-contact", data);
    } catch (error) {
      console.log("Failed to emit contact(update or create), ", error);
    }
  }

  private broadcastOnlineUsers(): void {
    const onlineUsers = Array.from(this.connectedUSers.values()).map(
      (userId) => ({ userId: userId.userId })
    );
    this.io.emit("onlineUsers", onlineUsers);
  }
}
function createBulkedNotifPayload(
  commenterBatch: string[],
  data: CommentEventPayload,
  capitializeFristWord: (text: string) => string,
  postOwnerData: IUser
) {
  return commenterBatch.map((commenterId) => ({
    receiver: commenterId,
    sender: data.data.user._id.toString(),
    post: data.postId,
    message:
      data.postOwnerId === data.data.user._id.toString()
        ? "commented on his post"
        : `commented on  ${capitializeFristWord(postOwnerData.username)} post`,
    type: "comment",
    createdAt: data.data.createdAt,
  }));
}

function getUniqueUserIdsExceptCommenterAndPostOwner(
  allIds: any,
  data: CommentEventPayload
) {
  const commentSetData = new Set<string>();
  for (let commenterId of allIds) {
    let id = commenterId.toString();
    // filter out the post owner and the commender id in the arraynotifData
    // we will only gloably notify users, except postOwner(the owner it self commented) and other users(user who commented and commented again)
    if (id !== data.postOwnerId && id !== data.data.user._id.toString()) {
      commentSetData.add(id);
    }
  }

  const NotifyId = Array.from(commentSetData);
  return NotifyId;
}
