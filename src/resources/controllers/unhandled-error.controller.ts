import { Request, Response, NextFunction } from "express";

import AppError from "@/utils/app-error.utils";

/*
 * @desc retuns structured error response for unhandled/wrong routes
 * @ascess public
 */

const unhandledRoutes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
};

export default unhandledRoutes;
