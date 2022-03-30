import { Response, Request, NextFunction } from "express";
/*
 * @desc get rid of repeated 'try-catch' blocks
 */

const catchAsync = (fn: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
