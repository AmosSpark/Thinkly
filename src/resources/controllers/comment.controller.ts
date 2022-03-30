import { Response, Request, NextFunction } from "express";

import jwt from "jsonwebtoken";
import catchAsync from "@/utils/catch-async.utils";
import AppError from "@/utils/app-error.utils";
import User from "@/resources/models/user.model";
import Comment from "@/resources/models/comment.model";
import {
  getAll,
  getOne,
  updateOne,
  deleteOne,
} from "@/resources/controllers/factory.handler.controller";
import * as dotenv from "dotenv";

dotenv.config();

/*
 * @route GET api/v1/mobile/comments
 * @desc get all comments
 * @ascess private
 */

const getComments = getAll(Comment);

/*
 * @route POST api/v1/mobile/articles:articleId/comments
 * @desc post a comment
 * @ascess private
 */

const postComment = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    // get user
    const JWT_SECRET = String(process.env.JWT_SECRET);
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) return err;
      const user = await User.findById(decoded.id);
      req.user = user;

      try {
        // create comment
        const newComment = await Comment.create({
          article: req.params.id,
          commentBy: req.user.id,
          comment: req.body.comment,
        });

        return res.status(201).json({
          status: `success`,
          data: {
            data: newComment,
          },
        });
      } catch (error: any) {
        return next(new AppError(error.message, 400));
      }
      next();
    });
  }
);

/*
 * @route GET api/v1/mobile/comments/:id
 * @desc get a comment
 * @ascess private
 */

const getOneComment = getOne(Comment, {
  path: "article commentBy",
  select: "title category fullName headline",
});

/*
 * @route PATCH api/v1/mobile/comments/:id
 * @desc update a comment
 * @ascess private
 */

const updateComment = updateOne(Comment);

/*
 * @route DEL api/v1/mobile/comments/:id
 * @desc delete a comment
 * @ascess private
 */

const deleteComment = deleteOne(Comment);

export {
  getComments,
  postComment,
  getOneComment,
  updateComment,
  deleteComment,
};
