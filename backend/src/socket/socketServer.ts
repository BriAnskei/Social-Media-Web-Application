import { Server } from "socket.io"; // Socket.io server class, which manages WebSocket connections.
import { Server as HttpServer } from "http"; // http server module from node.js
import { verifyToken } from "../middleware/auth";

import {
  NotifData,
  saveCommentNotif,
  saveLikeNotification,
} from "../controllers/notifController";

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
        console.log(token);

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

      socket.on(SOCKET_EVENTS.posts.LIKE_POST, (data: LikeEventPayload) =>
        this.handleLikePost(socket, data)
      );

      socket.on(
        SOCKET_EVENTS.posts.COMMENT_POST,
        (data: CommentEventPayload) => {
          this.handleCommentEvent(socket, data);
        }
      );

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
      console.log(`user Connected: ${socket.data.userId}:`);
      console.log(JSON.stringify(Object.fromEntries(this.connectedUSers)));
    } catch (error) {
      console.error("Error handling connection: ", error);
    }
  }

  private handleDisconnection(socket: any): void {
    try {
      this.connectedUSers.delete(socket.data.userId);
      console.log(`User Disconnected: ${socket.data.userId}`);

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

      console.log("like handle triggered: ", data);

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

      // only persist if the user(commenter) is not the postOwwner
      if (data.postOwnerId !== data.data.user) {
        commentEventData = await saveCommentNotif(commentEventData);
      }

      const notifEmitData = {
        isExist: false,
        data: commentEventData,
      };

      // notify owner if online
      const ownerSocket = this.connectedUSers.get(
        commentEventData.receiver.toString()
      );
      if (ownerSocket) {
        this.io
          .to(ownerSocket.socketId)
          .emit(SOCKET_EVENTS.posts.COMMENT_NOTIF, notifEmitData);
      }
    } catch (error) {
      console.error("Error handling post comment:", error);
      socket.emit("error", "Failed to process comment action");
    }
  }

  private broadcastOnlineUsers(): void {
    const onlineUsers = Array.from(this.connectedUSers.values()).map(
      (userId) => ({ userId: userId.userId })
    );
    this.io.emit("onlineUsers", onlineUsers);
  }
}
