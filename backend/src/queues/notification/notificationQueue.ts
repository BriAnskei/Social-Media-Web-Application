import { Queue } from "bullmq";
import { redisOptions } from "../redisOption";

export const notificationQueue = new Queue("notificationQueue", {
  connection: redisOptions,
});
