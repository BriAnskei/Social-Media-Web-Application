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
import { redisOptions } from "../queues/messageQueues";

connectDb();

// Constants
const QUEUE_NAME = "messageQueue";
const JOB_NAME = "sendMessage";

console.log("✅ Message worker started");

async function handleSendMessageJob(payload: {
  messagePayload: IMessageInput;
  convoId: string;
}) {
  const { messagePayload, convoId } = payload;
  const session = await mongoose.startSession();
  session.startTransaction(); // Start a new MongoDB transaction for atomic operations

  try {
    const [message] = await MessageModel.create([messagePayload], { session });

    const conversation = (await Conversation.findByIdAndUpdate(
      convoId,
      {
        $set: { deletedFor: [] },
        lastMessage: message._id,
        lastMessageAt: new Date(),
      },
      { session, new: true }
    )) as IConversation;

    // Commit the transaction — all operations above will be permanently saved
    await session.commitTransaction();

    emitMessageOnSend({ conversation, messageData: message });
  } catch (error) {
    // Abort the transaction — none of the operations will be saved
    await session.abortTransaction();
    throw error; // Re-throw to let BullMQ handle retry logic
  } finally {
    // End the session
    await session.endSession();
  }
}

/**
 * Processes jobs from the message queue
 */
async function processJob(job: Job) {
  console.log("job detected", job.name);

  if (job.name === JOB_NAME) {
    await handleSendMessageJob(job.data);
  } else {
    console.warn(`No handler found for job: ${job.name}`);
  }
}

// Create worker instance
const messageWorker = new Worker(QUEUE_NAME, processJob, {
  connection: redisOptions,
});

// Error handling
messageWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});

export default messageWorker;
