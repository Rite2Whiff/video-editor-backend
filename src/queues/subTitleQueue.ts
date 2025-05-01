import { Queue } from "bullmq";

export const subTitleQueue = new Queue("videoQueue", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

console.log("queue is running");
