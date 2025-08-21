import "dotenv/config";
import { Worker } from "bullmq";
import { redisOptions } from "../queues/redisOption";
import "dotenv/config";
import { connectDb } from "../config/db";
import { errorLog } from "../services/errHandler";
import { commentService, UserData } from "../services/comment.service";

import { notifService } from "../services/notification.service";
import mongoose, { Types } from "mongoose";
import { emitComment } from "../events/emitters";

connectDb();

console.log("✅ comment notification worker started");

interface PostCommentPayload {
  postId: string;
  postOwnerId: string;
  postOwnerName: string;
}

interface JobPayload {
  user: UserData;
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
        userId: payload.user._id,
        postOwnerId: payload.post.postOwnerId,
      });

      await processNotification(userIds, payload);
    } catch (error) {
      errorLog("commentQueue-worker", error as Error);
    }
  },
  { connection: redisOptions }
);

async function processNotification(userIds: string[], payload: JobPayload) {
  try {
    console.log("Procesing notifs: ", userIds);

    for (const id of userIds) {
      const notifDoc = await notifService.addCommentNotif({
        ...generateNotificationPayload(id, payload),
        sender: payload.user._id,
      });

      await emitComment(notifDoc);
    }
  } catch (error) {
    throw error;
  }
}

function generateNotificationPayload(id: string, payload: JobPayload) {
  return {
    receiver: id.toString(),
    sender: payload.user,
    post: payload.post.postId,
    message: generateMessage(payload, id),
    type: "comment",
    read: false,
    createdAt: payload.createdAt,
  };
}
function generateMessage(payload: JobPayload, id: string) {
  const regex = /^\w+/; // first name extraction
  return `${
    payload.post.postOwnerId === payload.user._id
      ? "Commented on his post"
      : payload.post.postOwnerId === id.toString()
      ? `${payload.user.fullName.match(regex)?.[0]} commented on your post`
      : `${payload.user.fullName.match(regex)?.[0]} commented on ${
          payload.post.postOwnerName.match(regex)?.[0]
        }'s post`
  }`;
}
