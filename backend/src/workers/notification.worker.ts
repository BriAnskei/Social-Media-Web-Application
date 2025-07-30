import "dotenv/config";
import { Worker } from "bullmq";
import { redisOptions } from "../queues/redisOption";
import "dotenv/config";
import { connectDb } from "../config/db";
import { errorLog } from "../services/errHandler";
import { commentService, UserData } from "../services/comment.service";

import { notifService } from "../services/notification.service";
import { Types } from "mongoose";
import { emitComment } from "../events/emitters";

connectDb();

interface PostCommentPayload {
  postId: string;
  postOwnerId: string;
  postOwnerFullName: string;
}

interface JobPayload {
  sender: UserData;
  post: PostCommentPayload;
  createdAt: Date;
}

new Worker(
  "notificationQueue",
  async (job) => {
    try {
      const payload = job.data as JobPayload;

      const userIds = await commentService.getUsersUniqueIds({
        postId: payload.post.postId,
        userId: payload.sender.id,
      });

      await processNotification(userIds, payload);
    } catch (error) {
      errorLog("commentQueue-worker", error as Error);
    }
  },
  { connection: redisOptions }
);

async function processNotification(
  userIds: Types.ObjectId[],
  payload: JobPayload
) {
  try {
    for (const id of userIds) {
      const notifDoc = await notifService.addCommentNotif({
        ...generateNotificationPayload(id, payload),
        sender: payload.sender.id,
      });

      await emitComment(notifDoc);
    }
  } catch (error) {
    throw error;
  }
}

function generateNotificationPayload(id: Types.ObjectId, payload: JobPayload) {
  return {
    receiver: id.toString(),
    sender: payload.sender,
    post: payload.post.postId,
    message: `${
      payload.post.postOwnerId === id.toString()
        ? "Commented in his post"
        : `${payload.sender.fullName.split("")[0]} commented on ${
            payload.post.postOwnerFullName.split("")[0]
          }'s post`
    }`,
    type: "comment",
    read: false,
    createdAt: payload.createdAt,
  };
}
