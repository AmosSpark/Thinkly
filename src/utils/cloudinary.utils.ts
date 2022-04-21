import { v2 as cloudinary } from "cloudinary";

import streamifier from "streamifier";
import * as dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const userDefaultPhoto: string =
  "https://res.cloudinary.com/amosspark/image/upload/q_100/v1650694677/Users/z7j3aaruqz4wmg6lu8bp.jpg";

const uploadPhotoToCloudinary = (
  buffer: Buffer,
  folderName: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        transformation: [
          {
            quality: 90,
          },
        ],
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export { cloudinary, userDefaultPhoto, uploadPhotoToCloudinary };
