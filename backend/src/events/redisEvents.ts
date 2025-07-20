// events/redisEvents.ts
import Redis from "ioredis";
import { redisOptions } from "../queues/messageQueues";

// Create separate Redis connections for pub/sub
const publisher = new Redis(redisOptions);
const subscriber = new Redis(redisOptions);

export class RedisEventEmitter {
  private subscriber: Redis;
  private publisher: Redis;

  constructor() {
    this.publisher = publisher;
    this.subscriber = subscriber;
  }

  // Emit event via Redis pub/sub
  async emit(eventName: string, data: any) {
    try {
      const message = JSON.stringify(data);
      await this.publisher.publish(eventName, message);
      console.log(`📡 Redis event published: ${eventName}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to publish Redis event ${eventName}:`, error);
      return false;
    }
  }

  // Listen for events via Redis pub/sub
  on(eventName: string, callback: (data: any) => void) {
    this.subscriber.subscribe(eventName);

    this.subscriber.on("message", (channel, message) => {
      if (channel === eventName) {
        try {
          const data = JSON.parse(message);
          console.log(`🔥 Redis event received: ${eventName}`);
          callback(data);
        } catch (error) {
          console.error(`💥 Failed to parse Redis event ${eventName}:`, error);
        }
      }
    });

    console.log(`📡 Subscribed to Redis event: ${eventName}`);
  }
}

export const redisEvents = new RedisEventEmitter();
