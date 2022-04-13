import { Response, Request, NextFunction } from "express";

import currentUser from "@/utils/current-usser.utils";
import catchAsync from "@/utils/catch-async.utils";
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

const getComments = getAll(Comment, {
  path: "article",
  select: "-body -author -noOfComments -createdAt -updatedAt",
});

const postComment = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    // get current user
    req.user = await currentUser(
      req.headers.authorization.split(" ")[1],
      String(process.env.JWT_SECRET)
    )();
    // create comment
    const newComment = await Comment.create({
      article: req.params.id,
      commentBy: req.user.id,
      comment: req.body.comment,
    });

    res.status(201).json({
      status: `success`,
      data: {
        data: newComment,
      },
    });
  }
);

/*
 * @route GET api/v1/mobile/comments/:id
 * @desc get a comment
 * @ascess private
 */

const getOneComment = getOne(Comment, {
  path: "article",
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
