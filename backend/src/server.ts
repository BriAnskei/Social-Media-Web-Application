import express, { Response, Request } from "express";
import cors from "cors";
import { connectDb } from "./config/db";
import "dotenv/config";
import userRouter from "./routes/userRoutes";
import postRouter from "./routes/postRoutes";
import authRoutes from "./routes/authRoutes";
import notifRouter from "./routes/notifRoutes";
import { createServer } from "http";
import { SocketServer } from "./socket/handlers/socketServer";
import messageRouter from "./routes/messageRoutes";

// ✅ Bull Board Imports
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { messageQueue } from "./queues/messageQueues";
import { likeQueue } from "./queues/post/likeQueue";
import { commentQueue } from "./queues/post/commentQueue";
import { uploadQueue } from "./queues/post/uploadQueue";
import commentRouter from "./routes/commentRoutes";

// connect Database
connectDb();

// app config
const app = express();
const PORT = 4000;

// middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [
    new BullMQAdapter(messageQueue),
    new BullMQAdapter(likeQueue),
    new BullMQAdapter(commentQueue),
    new BullMQAdapter(uploadQueue),
  ],
  serverAdapter,
});

app.use("/admin/queues", serverAdapter.getRouter());

// calling the socket connection
const httpServer = createServer(app);
const socketServer = new SocketServer(httpServer);
const messageHanlder = socketServer.messagetHandler;

// Static images
app.use("/images/posts", express.static(`${process.env.UPLOAD_PATH}/posts`));
app.use(
  "/uploads/profile",
  express.static(`${process.env.UPLOAD_PATH}/profile`)
);
app.use("/no-profile", express.static(`${process.env.UPLOAD_PATH}/profile`));
app.use(
  "/message/images",
  express.static(`${process.env.UPLOAD_PATH}/messages`)
);

// api endpoint(Routes)
app.use("/api/notify", notifRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/comment", commentRouter);
app.use("/api/token", authRoutes);
app.use("/api/messages", messageRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("API Working");
});

// wrap the express app in the httpServer
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(process.env.MONGO_URI);
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Server running on port http://localhost:${PORT}`);
});

// export for controller service usage
export { messageHanlder };
