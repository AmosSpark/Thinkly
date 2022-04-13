import { Response, Request, NextFunction } from "express";

import { Model } from "mongoose";
import AppError from "@/utils/app-error.utils";
import catchAsync from "@/utils/catch-async.utils";

const accessControl = (Model: Model<any>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findById(req.params.id);
    if (doc.commentBy) {
      if (doc.commentBy.id !== req.user.id) {
        return next(new AppError(`You can only delete your own document`, 401));
      }
    }
    next();
  });

export default accessControl;
