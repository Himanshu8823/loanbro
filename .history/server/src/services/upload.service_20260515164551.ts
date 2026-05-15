import cloudinary from "../config/cloudinary";
import { AppError } from "../utils/app-error";
import { MESSAGES } from "../constants/messages";
import { ISalarySlip } from "../models/loan.model";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const getFileType = (mimetype: string): ISalarySlip["fileType"] => {
  const map: Record<string, ISalarySlip["fileType"]> = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
  };
  return map[mimetype];
};

/**
 * Streams file buffer directly to Cloudinary using upload_stream.
 * PDFs are uploaded as resource_type "raw" — Cloudinary requires this
 * for non-image files to preserve the original format.
 */
export const uploadSalarySlip = (
  file: Express.Multer.File,
  folder: string
): Promise<ISalarySlip> => {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return reject(new AppError(MESSAGES.UPLOAD.INVALID_TYPE, 400));
    }

    if (file.size > MAX_FILE_SIZE) {
      return reject(new AppError(MESSAGES.UPLOAD.SIZE_EXCEEDED, 400));
    }

    const resourceType = file.mimetype === "application/pdf" ? "raw" : "image";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        allowed_formats: ["pdf", "jpg", "jpeg", "png"],
      },
      (error, result) => {
        if (error || !result) {
          return reject(new AppError("File upload failed. Please try again.", 500));
        }

        resolve({
          fileName: file.originalname,
          fileUrl: result.secure_url,
          fileType: getFileType(file.mimetype),
          fileSize: file.size,
          uploadedAt: new Date(),
        });
      }
    );

    uploadStream.end(file.buffer);
  });
};