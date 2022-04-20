import { Request } from "express";

import multer from "multer";
import AppError from "@/utils/app-error.utils";

const multerStorage = multer.memoryStorage();

// check if uploaded file is an image
const multerFilter = (req: Request, file: any, cb: any) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Unsupported file format! Please upload only images with .jpeg/.jpg or .png extensions.",
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 1024 * 1024 },
  fileFilter: multerFilter,
});

const uploadPhoto = upload.single("photo");

export default uploadPhoto;
