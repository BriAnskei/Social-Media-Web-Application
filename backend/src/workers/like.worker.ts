// workers/postWorker.ts
import { Worker } from "bullmq";
import { redisOptions } from "../queues/redisOption";
import { connectDb } from "../config/db";
import "dotenv/config";
import mongoose from "mongoose";
import { emitPostLiked } from "../events/emitters";
import { notifService } from "../services/notification.service";
import { INotification } from "../models/notificationModel";
import { postService } from "../services/post.service";

connectDb();

console.log("✅ like worker started");

new Worker(
  "likeQueue",
  async (job) => {
    const { userId, postId } = job.data;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const res = await postService.toggleLikeRetrivePostData(
        job.data,
        session
      );

      const { isUserNotThePostOwner, postOwnerId } = res;
      let notifData: { isExist: boolean; data: INotification } | undefined;

      if (isUserNotThePostOwner) {
        notifData = await notifService.createOrDropNotif(
          {
            receiver: postOwnerId.toString(),
            sender: userId,
            post: postId,
            message: "liked your post",
            type: "like",
          },
          session
        );
      }

      emitPostLiked({
        postOwnerId,
        userId: userId as string,
        postId: postId as string,
        notifData,
      });

      await session.commitTransaction();
      return { success: true, message: "posteLiked" };
    } catch (error) {
      await session.abortTransaction();
      console.error("Failed on worker: likeQueue", error);
      return { success: true, message: "failed" };
    } finally {
      await session.endSession();
    }
  },
  { connection: redisOptions }
);
