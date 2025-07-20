import { Queue } from "bullmq";
import IORedis, { RedisOptions } from "ioredis";

export const redisOptions: RedisOptions = {
  host: "localhost", // Same as the Docker Compose service name
  port: 6379,
  maxRetriesPerRequest: null, // ✅ required for BullMQ workers
};
//Use "redis" as the host because it's the service name from Docker Compose.
// It acts as the hostname within the Docker network.

export const messageQueue = new Queue("messageQueue", {
  connection: redisOptions,
});
// use the redis instance connection in queue(bullmq). with this bullmq will be connected to the redis running port
