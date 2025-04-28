import { Router } from "express";
import { authMiddleware } from "../authMiddleware";

const router = Router();

router.use(authMiddleware);

router.post("/api/video/upload", (req, res) => {});

router.post("/api/video/:id/trim", (req, res) => {});

router.post("api/video/:id/subtitles", (req, res) => {});

router.post("api/video/:id/render", (req, res) => {});

router.get("/api/video/:id/download", (req, res) => {});

export default router;
