// queues/postQueue.ts
import { Queue } from "bullmq";
import { redisOptions } from "../redisOption";

export const uploadQueue = new Queue("uploadQueue", {
  connection: redisOptions,
});
