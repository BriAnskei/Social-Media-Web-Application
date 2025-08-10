// workers/message.worker.ts
import { IConnection, Job, Worker } from "bullmq";
import mongoose from "mongoose";
import { IMessage, MessageModel } from "../models/messageModel";
import { Conversation, IConversation } from "../models/conversationModel";
import "dotenv/config";
import Redis from "ioredis";
import { IMessageInput } from "../utils/buildMessagePayload";
import { connectDb } from "../config/db";
import { emitMessageOnSend } from "../events/emitters";
import { redisOptions } from "../queues/redisOption";

connectDb();

console.log("✅ Message worker started");

const QUEUE_NAME = "messageQueue";

/**
 * Processes jobs from the message queue
 */
async function processJob(job: Job) {
  const { messagePayload, convoId } = job.data as {
    messagePayload: IMessageInput;
    convoId: string;
  };

  const session = await mongoose.startSession();
  session.startTransaction(); // Start a new MongoDB transaction for atomic operations

  try {
    const [message] = await MessageModel.create([messagePayload], { session });

    const conversation = (await Conversation.findByIdAndUpdate(
      convoId,
      {
        $set: { deletedFor: [] },
        lastMessage: message._id,
        lastMessageAt: messagePayload.createdAt,
      },
      { session, new: true }
    )) as IConversation;

    if (!messagePayload.read) {
      await Conversation.updateOne(
        {
          _id: convoId,
          "unreadCounts.user": messagePayload.recipient,
        },
        {
          $inc: { "unreadCounts.$.count": 1 }, // using  positional $ operator  in which index is to update
        },
        { session }
      );
    }

    // Commit the transaction — all operations above will be permanently saved
    await session.commitTransaction();

    emitMessageOnSend({ conversation, messageData: message });
  } catch (error) {
    // Abort the transaction — none of the operations will be saved
    await session.abortTransaction();
    console.error("Failed handleSendMessageJob ", error);
  } finally {
    // End the session
    await session.endSession();
  }
}

// Create worker instance
const messageWorker = new Worker(QUEUE_NAME, processJob, {
  connection: redisOptions,
  concurrency: 10, // Process 10 jobs simultaneously
  limiter: {
    max: 100, // Max 100 jobs per duration
    duration: 60000, // Per minute
  },
});

// Add to your worker
messageWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

messageWorker.on("progress", (job, progress) => {
  console.log(`Job ${job.id} is ${progress}% complete`);
});

// Error handling
messageWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});

export default messageWorker;
