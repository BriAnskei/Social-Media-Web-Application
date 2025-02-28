import { Server } from "socket.io"; // Socket.io server class, which manages WebSocket connections.
import { Server as HttpServer } from "http"; // http server module from node.js
import { verifyToken } from "../middleware/auth";
import { error } from "console";
import { NotifData, saveNotification } from "../controllers/notifController";

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

// Define events
const SOCKET_EVENTS = {
  // Like Events
  LIKE_POST: "likePost",
  POST_LIKED: "postLiked",
  LIKE_NOTIFY: "likeNotify",
};

export class SocketServer {
  private io: Server;
  private connectedUSers: Map<string, ConnectedUser> = new Map();

  // .on(event, callback)	Listens for a specific event from the client.
  // .to(socketId).emit(event, data)	Sends an event only to a specific client using their socketId.

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      // Create the server instance bound to node.js server module
      cors: {
        origin: "http://localhost:5173",
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
          //The error is sent back to the client, which will receive an "error" event on its end.connect_error
        }

        socket.data.userId = decoded?.userId; // stores the token in the socketData
        next();
      } catch (error) {
        next(new Error("Authentication Error"));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket) => {
      this.handleConnection(socket); // register the user as connected(online)

      socket.on("disconnect", () => this.handleDisconnection(socket));
      socket.on(SOCKET_EVENTS.LIKE_POST, (data: LikeEventPayload) =>
        this.handleLikePost(socket, data)
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
      // boadcast to all except the sender
      socket.broadcast.emit("postLiked", {
        userId,
        postOwnerId,
        postId,
      });

      // send and persist notification of the liker is not the post owner
      if (userId !== postOwnerId) {
        const data: NotifData = {
          receiver: postOwnerId,
          sender: userId,
          post: postId,
          message: "liked your post",
          type: "like",
        };

        const notifdata = await saveNotification(data); // save to DB

        // Notify owner if online
        const ownerSocket = this.connectedUSers.get(postOwnerId);
        if (ownerSocket) {
          this.io
            .to(ownerSocket.socketId)
            .emit(SOCKET_EVENTS.LIKE_NOTIFY, notifdata);
        }
      }
    } catch (error) {
      console.error("Error handling post like:", error);
      socket.emit("error", "Failed to process like action");
    }
  }

  private broadcastOnlineUsers(): void {
    const onlineUsers = Array.from(this.connectedUSers.values()).map(
      (userId) => ({ userId: userId.userId })
    );
    this.io.emit("onlineUsers", onlineUsers);
  }
}
