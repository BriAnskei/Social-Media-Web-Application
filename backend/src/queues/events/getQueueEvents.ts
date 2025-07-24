import { QueueEvents } from "bullmq";
import { redisOptions } from "../redisOption";

// queueEvents.ts
const queueEventsMap = new Map<string, QueueEvents>();

export const getQueueEvents = (eventInstance: string): QueueEvents => {
  if (!queueEventsMap.has(eventInstance)) {
    const queueEvents = new QueueEvents(eventInstance, {
      connection: redisOptions,
    });
    queueEventsMap.set(eventInstance, queueEvents);
  }
  return queueEventsMap.get(eventInstance)!;
};

// Cleanup
process.on("SIGTERM", async () => {
  for (const [name, queueEvents] of queueEventsMap) {
    await queueEvents.close();
  }
  queueEventsMap.clear();
});

// | Signal    | Description                                        |
// | --------- | -------------------------------------------------- |
// | `SIGTERM` | Graceful shutdown (most common, should be handled) |
// | `SIGINT`  | Sent when you press `Ctrl + C` in terminal         |
// | `SIGKILL` | Force kill — **cannot be caught or handled**       |
