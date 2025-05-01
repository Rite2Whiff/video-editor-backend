import { subTitleQueue } from "../queues/subTitleQueue";

export async function addSubtitleJob(
  videoPath: string,
  subtitlePath: string,
  outputPath: string
) {
  try {
    await subTitleQueue.add("addSubtitles", {
      videoPath,
      subtitlePath,
      outputPath,
    });

    console.log("Job added to the queue to add subtitles to the video.");
  } catch (error) {
    console.error("Error adding job to queue:", error);
  }
}
