import "dotenv/config";
import { connectDb } from "../config/db";

import { Worker } from "bullmq";
import postModel from "../models/postModel";
import { redisOptions } from "../queues/redisOption";
import mongoose from "mongoose";
import { postService } from "../services/post.service";
import { emitNewPostToOwner } from "../events/emitters";

connectDb();

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
      const newPost = await postService.createPost(postPayload);

      await emitNewPostToOwner(newPost);
    } catch (error) {
      console.log("failed on worker-uploadQueue", error);
    }
  },
  { connection: redisOptions }
);
