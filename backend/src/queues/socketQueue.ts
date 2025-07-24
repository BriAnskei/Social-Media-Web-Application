import { Queue } from "bullmq";
import { redisOptions } from "./redisOption";

// queues/socketQueue.ts
export const socketQueue = new Queue("socketQueue", {
  connection: redisOptions,
});
