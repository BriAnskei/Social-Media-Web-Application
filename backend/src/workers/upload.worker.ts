import "dotenv/config";
import { connectDb } from "../config/db";

import { Worker } from "bullmq";
import { redisOptions } from "../queues/redisOption";
import mongoose from "mongoose";
import { emitNewPost } from "../events/emitters";
import { postService } from "../services/post.service";

connectDb();

console.log("✅ upload worker started");

export interface JopPayload {
  user: mongoose.mongo.BSON.ObjectId;
  content: any;
  image?: string;
}

new Worker(
  "uploadQueue",
  async (job) => {
    try {
      const postPayload = job.data as JopPayload;

      console.log("JON PAYLOAED RECIEVED: ", postPayload);

      const payloadRes = await postService.createPost(postPayload);

      await emitNewPost({
        data: payloadRes.newPost,
        userName: payloadRes.userName,
      });
    } catch (error) {
      console.log("failed on worker-uploadQueue", error);
    }
  },
  {
    connection: redisOptions,
    concurrency: 10,
    limiter: {
      max: 100,
      duration: 60000,
    },
  }
);
