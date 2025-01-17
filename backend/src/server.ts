import express, { Response, Request } from "express";
import cors from "cors";
import { connectDb } from "./config/db";
import "dotenv/config";
import userRouter from "./routes/userRoutes";
import postRouter from "./routes/postRoutes";
import path from "path";

// app config
const app = express();
const PORT = 4000;

// middleware
app.use(express.json());
app.use(cors());

// connect Database
connectDb();

// Static images
app.use("/images/posts", express.static(`${process.env.UPLOAD_PATH}/posts`));
app.use(
  "/uploads/profile",
  express.static(`${process.env.UPLOAD_PATH}/profile`)
);

// api endpoit(Routes)
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("API Working");
});

app.listen(PORT, () => {
  console.log(process.env.MONGO_URI);
  console.log(`Server running on port http://localhost:${PORT}`);
});
