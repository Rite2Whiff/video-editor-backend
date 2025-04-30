import { Request, Router } from "express";
import { authMiddleware } from "../authMiddleware";
import {
  upload,
  downloadVideo,
  extractMetadata,
  trimVideo,
  uploadTrimmedVideo,
} from "../upload";
import { S3File } from "../interface";
import path from "path";
import { prismaClient } from "../prismaClient";

const router = Router();

router.use(authMiddleware);

router.post(
  "/api/video/upload",
  upload.single("video"),
  async (req: Request, res) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        message: "Please login first",
      });
      return;
    }

    try {
      const file = req.file as S3File;

      if (!file) {
        res.status(400).json({
          message: "Please provide a correct file",
        });
        return;
      }
      const videoUrl = file.location;
      const tempPath = path.join(__dirname, "temp", `${Date.now()}_video`);
      await downloadVideo(videoUrl, tempPath);
      const metadata = await extractMetadata(tempPath);
      const video = await prismaClient.video.create({
        data: {
          userId: userId,
          name: file.originalname,
          duration: metadata.format.duration as number,
          size: metadata.format.size as number,
          originalPath: file.location,
        },
      });
      res.json({
        videoId: video.id,
        message: "Video has been uploaded successfully",
      });
    } catch (error) {
      res.json({
        message: error,
      });
    }
  }
);

router.post("/api/video/:id/trim", async (req: Request, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({
      message: "Please login first",
    });
    return;
  }
  const { startTime, endTime } = req.body;
  const videoId = req.params.id;
  const video = await prismaClient.video.findFirst({
    where: {
      userId: userId,
      id: videoId,
    },
  });
  const s3Key = `videos/trimmed/${videoId}-trimmed.mp4`;
  const inputPath = path.join(__dirname, "temp", `${videoId}-input.mp4`);
  await downloadVideo(video?.originalPath as string, inputPath);
  const outputPath = path.join(__dirname, "temp", `${videoId}-trimmed.mp4`);
  await trimVideo(inputPath, outputPath, startTime, endTime);
  console.log("Your video has been trimmed");
  const response = await uploadTrimmedVideo(outputPath, s3Key);
  console.log("your trimmed video has been uploaded");
  await prismaClient.video.update({
    data: {
      trimmedPath: response,
    },
    where: {
      userId: userId,
      id: videoId,
    },
  });
  res.status(200).json({
    message: "Video has been successfully trimmed",
    videoUrl: response,
  });
});

router.post("api/video/:id/subtitles", (req, res) => {});

router.post("api/video/:id/render", (req, res) => {});

router.get("/api/video/:id/download", (req, res) => {});

export default router;
