// queues/postQueue.ts
import { Queue } from "bullmq";
import { redisOptions } from "../redisOption";

export const likeQueue = new Queue("likeQueue", { connection: redisOptions });
