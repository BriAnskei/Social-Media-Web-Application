import express, { Response, Request } from "express";
import cors from "cors";
import { connectDb } from "./config/db";
import "dotenv/config";
import userRouter from "./routes/userRoutes";
import postRouter from "./routes/postRoutes";
import authRoutes from "./routes/authRoutes";
import notifRouter from "./routes/notifRoutes";
import { createServer } from "http";
import { SocketServer } from "./socket/socketServer";

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

// connect Database
connectDb();

// calling the socket connection
const httpServer = createServer(app);
new SocketServer(httpServer);

// Static images
app.use("/images/posts", express.static(`${process.env.UPLOAD_PATH}/posts`));
app.use(
  "/uploads/profile",
  express.static(`${process.env.UPLOAD_PATH}/profile`)
);

// api endpoint(Routes)
app.use("/api/notify", notifRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/token", authRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("API Working");
});

// wrap the express app in the httpServer
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(process.env.MONGO_URI);
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Server running on port http://localhost:${PORT}`);
});
