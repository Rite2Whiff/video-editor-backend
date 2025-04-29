import { Request, Router } from "express";
import { authMiddleware } from "../authMiddleware";
import { upload, downloadVideo, extractMetadata } from "./upload";
import { S3File } from "../interface";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { prismaClient } from "../prismaClient";
import { FfprobeMetadata } from "../interface";

const router = Router();

router.use(authMiddleware);

router.post(
  "/api/video/upload",
  upload.single("video"),
  async (req: Request, res) => {
    let videoMetadata: FfprobeMetadata;
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

router.post("/api/video/:id/trim", (req, res) => {});

router.post("api/video/:id/subtitles", (req, res) => {});

router.post("api/video/:id/render", (req, res) => {});

router.get("/api/video/:id/download", (req, res) => {});

export default router;
