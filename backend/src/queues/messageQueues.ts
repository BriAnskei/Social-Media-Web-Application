import { Queue } from "bullmq";
import { RedisOptions } from "ioredis";
import { redisOptions } from "./redisOption";

export const messageQueue = new Queue("messageQueue", {
  connection: redisOptions,
});
// use the redis instance connection in queue(bullmq). with this bullmq will be connected to the redis running port
