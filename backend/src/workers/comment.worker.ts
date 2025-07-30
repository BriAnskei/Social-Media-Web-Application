import "dotenv/config";
import { Worker } from "bullmq";
import { redisOptions } from "../queues/redisOption";
import "dotenv/config";
import { connectDb } from "../config/db";
import { errorLog } from "../services/errHandler";
import { commentService } from "../services/comment.service";

connectDb();

console.log("✅ comment worker started");

interface JobPayload {
  user: string;
  postId: string;
  content: string;
  createdAt: Date;
}

new Worker(
  "commentQueue",
  async (job) => {
    try {
      const payload = job.data as JobPayload;

      await commentService.createComment(payload);
    } catch (error) {
      errorLog("commentQueue-worker", error as Error);
    }
  },
  { connection: redisOptions }
);
