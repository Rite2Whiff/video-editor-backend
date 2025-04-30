import { PutObjectCommand, S3Client, S3KeyFilter } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import fs, { PathLike } from "fs";
import http from "http";
import https from "https";
import ffmpeg from "fluent-ffmpeg";
import mime from "mime-types";

dotenv.config();

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME as string,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const fileName = `videos/${Date.now().toString()}${ext}`;
      cb(null, fileName);
    },
  }),
});

export function downloadVideo(url: string, destination: PathLike) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    const handler = url.startsWith("https") ? https : http;
    handler
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close(() => resolve(destination));
          console.log("your video has downloaded");
        });
      })
      .on("error", (err) => {
        fs.unlink(destination, () => reject(err));
        console.log(err);
      });
  });
}

export function extractMetadata(path: string): Promise<ffmpeg.FfprobeData> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path, (err, metadata) => {
      fs.unlinkSync(path);

      if (err) {
        console.error(err);
        reject(err);
        return;
      }

      resolve(metadata);
    });
  });
}

export async function uploadTrimmedVideo(filePath: string, s3Key: string) {
  const fileStream = fs.createReadStream(filePath);

  const uploadParams = {
    Bucket: "video-editor-backend",
    Key: s3Key,
    Body: fileStream,
    ContentType: "video/mp4",
    ACL: "public-read" as const,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
  return `https://${uploadParams.Bucket}.s3.ap-south-1.amazonaws.com/${s3Key}`;
}

export async function trimVideo(
  inputPath: string,
  outputPath: string,
  startTime: number,
  endTime: number
) {
  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(startTime)
      .setDuration(endTime - startTime)
      .output(outputPath)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
}
