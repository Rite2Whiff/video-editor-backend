import { Worker } from "bullmq";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";

export const videoWorker = new Worker(
  "videoQueue",
  async (job) => {
    const { videoPath, subtitlePath, outputPath } = job.data;

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const safeSubtitlePath = subtitlePath
      .replace(/\\/g, "/")
      .replace(/:/g, "\\:");
    const filterString = `subtitles='${safeSubtitlePath}'`;

    try {
      await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .videoFilters(filterString)
          .output(outputPath)
          .on("end", () => {
            console.log("Subtitles added successfully!");
            resolve("subtiles added successfully");
          })
          .on("error", (err) => {
            console.error("Error adding subtitles:", err);
            reject("Error adding subtitles");
          })
          .run();
      });

      console.log(`Video processed with subtitles: ${outputPath}`);
      console.log(outputPath);
    } catch (error) {
      console.error("Error adding subtitles:", error);
      throw error;
    }
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);
