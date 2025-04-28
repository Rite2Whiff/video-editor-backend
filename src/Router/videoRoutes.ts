import { Request, Router } from "express";
import { authMiddleware } from "../authMiddleware";
import { upload } from "./upload";

const router = Router();

router.use(authMiddleware);

router.post(
  "/api/video/upload",
  upload.single("video"),
  (req: Request, res) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        message: "Please login first",
      });
      return;
    }
    const file = req.file;
    if (!file) {
      res.status(400).json({
        message: "Please provide a correct file",
      });
      return;
    }

    res.json({
      message: "File uploaded successfully",
    });
  }
);

router.post("/api/video/:id/trim", (req, res) => {});

router.post("api/video/:id/subtitles", (req, res) => {});

router.post("api/video/:id/render", (req, res) => {});

router.get("/api/video/:id/download", (req, res) => {});

export default router;
