import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
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
