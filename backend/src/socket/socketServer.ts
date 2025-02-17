import { Server } from "socket.io"; // Socket.io server class, which manages WebSocket connections.
import { Server as HttpServer } from "http"; // http server module from node.js
import { verifyToken } from "../middleware/auth";

interface ConnectedUserTypes {
  userId: string;
  socketId: string;
}

interface LikeHandlerTypes {
  postId: string;
  postOwnerId: string;
  userId: string;
  username: string;
}

export class SocketServer {
  private io: Server;
  private connectedUser: ConnectedUserTypes[] = []; // tracks of connected users

  // .on(event, callback)	Listens for a specific event from the client.
  // .to(socketId).emit(event, data)	Sends an event only to a specific client using their socketId.

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      // Create the server instance bound to node.js server module
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"], // allowed methods
      },
    });

    this.setUpMiddleware(); // method to authenticate users. Verify first
    this.setupEventHandlers(); // handle socket events
  }

  private setUpMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        // this asyncfuntion will run before the clients connects
        const token = socket.handshake.auth.accessToken; // extracts the token from the initial(handshake) req from the client

        if (!token) return next(new Error("No Token provided"));

        const decoded = await verifyToken(token);
        socket.data.userId = decoded?.userId; // stores the token in the socketData
        next();
      } catch (error) {
        next(new Error("Authentication Error"));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket) => {
      // this function runs when a new users connect
      console.log(`User connected: ${socket.data.userId}`);

      // Stores the connected user
      this.connectedUser.push({
        userId: socket.data.userId,
        socketId: socket.id,
      });

      console.log(this.connectedUser);

      // handle disconnection
      socket.on("disconnect", () => {
        this.connectedUser = this.connectedUser.filter(
          (user) => user.socketId !== socket.id
        );
        console.log(`user disconnected: ${socket.data.userId}`);
      });

      // handling post likes
      socket.on("likePost", async (data: LikeHandlerTypes) => {
        console.log(data);

        // Checks if the post owner is online
        const targetSocket = this.connectedUser.find(
          (user) => user.userId === data.postOwnerId
        );

        if (targetSocket) {
          // if online, send event to the specific post owner
          this.io.to(targetSocket.socketId).emit("postLiked", {
            postId: data.postId,
            userId: data.userId,
            username: data.username,
          });
        } else {
          console.log("owner is  not online");
        }
      });
    });
  }
}
