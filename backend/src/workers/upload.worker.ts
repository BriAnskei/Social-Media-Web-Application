import "dotenv/config";
import { connectDb } from "../config/db";

import { Worker } from "bullmq";
import postModel from "../models/postModel";
import { redisOptions } from "../queues/redisOption";

connectDb();

new Worker(
  "uploadQueue",
  async (job) => {
    try {
      const postPayload = job.data;

      const post = await postModel.create(postPayload);

      return { success: true, message: "post created", posts: post };
    } catch (error) {
      console.log("failed on worker-uploadQueue", error);
      throw error;
    }
  },
  { connection: redisOptions }
);
