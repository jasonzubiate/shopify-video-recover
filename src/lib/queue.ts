import { Queue } from 'bullmq';

export const videoQueue = new Queue('video', {
  connection: {
    host: process.env.UPSTASH_REDIS_REST_URL!,
    password: process.env.UPSTASH_REDIS_REST_TOKEN!,
  },
});
