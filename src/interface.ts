import { Request } from "express";

declare module "express" {
  export interface Request {
    userId?: string;
  }
}

export interface S3File extends Express.Multer.File {
  location: string;
  key: string;
  bucket: string;
}

export interface FfprobeMetadata {
  format: {
    filename: string;
    nb_streams: number;
    format_name: string;
    format_long_name: string;
    duration: string; // sometimes string, so parseFloat when needed
    size: string;
    bit_rate: string;
    tags?: Record<string, string>;
  };
}
