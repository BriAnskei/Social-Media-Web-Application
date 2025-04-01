import { Server } from "socket.io"; // Socket.io server class, which manages WebSocket connections.
import { Server as HttpServer } from "http"; // http server module from node.js
import { verifyToken } from "../middleware/auth";

import {
  NotifData,
  saveCommentNotif,
  saveFollowNotif,
  saveLikeNotification,
} from "../controllers/notifController";
import { getUsersFolowers } from "../controllers/userController";
import mongoose from "mongoose";
import notificationModel from "../models/notificationModel";

interface ConnectedUser {
  userId: string;
  socketId: string;
  username?: string;
}

interface LikeEventPayload {
  postId: string;
  postOwnerId: string;
  userId: string;
  username: string;
}

interface CommentEventPayload {
  postId: string;
  postOwnerId: string;
  data: {
    user: string;
    content: string;
    createdAt: Date;
  };
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

    this.initializeServer();
  }

  private async initializeServer(): Promise<void> {
    try {
      await this.setUpMiddleware();
      this.setupEventHandlers();
    } catch (error) {
      console.log("Failed to initialize socket server: ", error);
    }
  }

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

  private setupEventHandlers() {
    // emplmenting events of tha users that are in the connection room
    this.io.on("connection", (socket) => {
      this.handleConnection(socket); // register the user as connected(online) first

      socket.on("disconnect", () => this.handleDisconnection(socket));

      socket.on(SOCKET_EVENTS.posts.POST_CREATED, (data: any) => {
        this.handlePostUploadEvent(socket, data);
      });

      socket.on(SOCKET_EVENTS.posts.LIKE_POST, (data: LikeEventPayload) =>
        this.handleLikePost(socket, data)
      );

      socket.on(
        SOCKET_EVENTS.posts.COMMENT_POST,
        (data: CommentEventPayload) => {
          this.handleCommentEvent(socket, data);
        }
      );

      // user event
      socket.on(SOCKET_EVENTS.user.USER_FOLLOW, (data: any) => {
        this.handleFollowEvent(socket, data);
      });

      // post notfication
      socket.on(SOCKET_EVENTS.notification.POST_UPLOADED, (data: any) => {
        this.handlePostUploadEvent(socket, data);
      });

      // Handle Error
      socket.on("error", (error) => {
        console.error("Socket Server Error", error);
        socket.emit("error", "An error occured");
      });
    });
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

  private async handleLikePost(
    socket: any,
    data: LikeEventPayload
  ): Promise<void> {
    const { userId, postOwnerId, postId } = data;
    try {
      // boadcast to all users (that is in the room in cluding the owner) except the sender
      socket.broadcast.emit(SOCKET_EVENTS.posts.POST_LIKED, {
        // this will only increase the # of likes in the ui of other online users using reducer function in slice
        userId,
        postOwnerId,
        postId,
      });

      // send and persist notification of the liker(userId) if its not the post owner
      if (userId !== postOwnerId) {
        const data: NotifData = {
          receiver: postOwnerId,
          sender: userId,
          post: postId,
          message: "liked your post",
          type: "like",
        };

        const notifdata = await saveLikeNotification(data); // persist notification of the owner

        // Notify owner if online
        const ownerSocket = this.connectedUSers.get(postOwnerId);
        if (ownerSocket) {
          this.io
            .to(ownerSocket.socketId)
            .emit(SOCKET_EVENTS.posts.LIKE_NOTIFY, notifdata);
        }
      }
    } catch (error) {
      console.error("Error handling post like:", error);
      socket.emit("error", "Failed to process like action");
    }
  }

  private async handleCommentEvent(
    socket: any,
    data: CommentEventPayload
  ): Promise<void> {
    try {
      if (!data) {
        socket.emit(
          "error",
          "Failed to process comment action, no data inputted"
        );
        return;
      }

      // boeadcast commend data to all users in the room(except to sender)
      socket.broadcast.emit(SOCKET_EVENTS.posts.POST_COMMENTED, data);

      let commentEventData: NotifData = {
        receiver: data.postOwnerId,
        sender: data.data.user,
        post: data.postId,
        message: "commented on your post",
        type: "comment",
        createdAt: data.data.createdAt,
      };

      // only persist notify(if online)if the user(commenter) is not the postOwwner
      if (data.postOwnerId !== data.data.user) {
        commentEventData = await saveCommentNotif(commentEventData);

        const notifEmitData = {
          isExist: false,
          data: commentEventData,
        };
        // trace the bug, when the owner liked its own post
        // notify owner if online
        const ownerSocket = this.connectedUSers.get(
          commentEventData.receiver.toString() // convert object data to string
        );
        if (ownerSocket) {
          this.io
            .to(ownerSocket.socketId)
            .emit(SOCKET_EVENTS.posts.COMMENT_NOTIF, notifEmitData);
        }
      }
    } catch (error) {
      console.error("Error handling post comment:", error);
      socket.emit("error", "Failed to process comment action");
    }
  }

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

      const notifData = await saveFollowNotif(followEventPayload);

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

  private async handlePostUploadEvent(socket: any, data: any): Promise<void> {
    try {
      const { userId, postId } = data;

      const usersFollowers = await getUsersFolowers(userId);

      if (!usersFollowers || usersFollowers.length === 0) {
        console.log("User has no followers or couldn't fetch followers");
        return;
      }

      console.log(
        "Post event triggered,  performing batch proccessing approach"
      );

      // we use batch proccessing approach for high followers
      const batchSize = 1000;
      const totalFollowers = usersFollowers.length;

      // const postNotificationRoom = `post-notification:${postId}`;
      // This creates a room for all users interested in this post notification. The benefits are:
      // 1. Efficient Broadcasts
      // Instead of sending notifications individually to each follower:

      // this.io.to(followerSocket.socketId).emit(...)
      // We can broadcast to all followers at once using:

      // this.io.to(postNotificationRoom).emit("post-notification", { ... });
      // WILL EMPLEMENT THIS IN THE FUTURE HEHEHE

      for (let i = 0; i < totalFollowers; i += batchSize) {
        const followersBatch = usersFollowers.slice(i, i + batchSize);

        // Create bulk notifications in database
        const bulkNotifications = followersBatch.map((followerId) => ({
          receiver: followerId,
          sender: mongoose.Types.ObjectId.createFromHexString(userId),
          post: mongoose.Types.ObjectId.createFromHexString(postId),
          message: "uploaded a new post",
          type: "post",
        }));

        await notificationModel.insertMany(bulkNotifications);
        // Check which followers are online and notify them
        for (const followerId of followersBatch) {
          const followerSocket = this.connectedUSers.get(followerId.toString());
          if (followerSocket) {
            // Send notification to the online follower
            this.io
              .to(followerSocket.socketId)
              .emit(SOCKET_EVENTS.notification.UPLOAD_POST, {
                postId,
                userId,
                type: "upload",
                message: `uploaded a new post`,
              });
          }
        }

        // Log progress for large follower counts
        if (totalFollowers > batchSize) {
          console.log(
            `Processed ${Math.min(
              i + batchSize,
              totalFollowers
            )}/${totalFollowers} followers`
          );
        }
      }

      console.log(`Completed notification process for post ${postId}`);
    } catch (error) {
      console.error("Error handling post upload event: ", error);
      socket.emit("error", "Failed to process post upload notifications");
    }
  }

  private broadcastOnlineUsers(): void {
    const onlineUsers = Array.from(this.connectedUSers.values()).map(
      (userId) => ({ userId: userId.userId })
    );
    this.io.emit("onlineUsers", onlineUsers);
  }
}
