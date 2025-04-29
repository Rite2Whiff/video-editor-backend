import { Request, Router } from "express";
import { authMiddleware } from "../authMiddleware";
import { upload, uploadToS3 } from "./upload";
import ffmpeg = require("ffmpeg");

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
      const file = req.file;
      if (!file) {
        res.status(400).json({
          message: "Please provide a correct file",
        });
        return;
      }
      const response = uploadToS3(file);
      console.log(response);
      res.json({
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
