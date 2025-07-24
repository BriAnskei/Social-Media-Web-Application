import "dotenv/config";
import { Worker } from "bullmq";
import { redisOptions } from "../queues/redisOption";
import "dotenv/config";
import { emitPostComment } from "../events/emitters";
import { postService } from "../services/post.service";
import { connectDb } from "../config/db";

connectDb();

console.log("✅ comment worker started");

new Worker(
  "commentQueue",
  async (job) => {
    try {
      const payload = job.data;
      console.log("proccesing worker: ", payload);

      const postData = await postService.commentOnPost(payload);

      if (!postData) {
        throw new Error("Post data return value is undifine");
      }

      const newComment = postData.comments[postData.comments.length - 1];
      // emition and return response
      const commentPayload = {
        user: newComment.user.toString(),
        content: newComment.content,
        createdAt: newComment.createdAt,
      };

      emitPostComment({
        postId: postData?._id! as string,
        postOwnerId: postData?.user.toString()!,
        data: commentPayload,
      });

      return {
        success: true,
        message: "Comment succesfully added",
        commentData: commentPayload,
      };
    } catch (error) {
      console.log("Failed on worker-commentQueue, ", error);
      throw error;
    }
  },
  { connection: redisOptions }
);
