import { Response, Request, NextFunction } from "express";

import currentUser from "@/utils/current-usser.utils";
import catchAsync from "@/utils/catch-async.utils";
import Like from "@/resources/models/like.model";
import {
  getAll,
  getOne,
  deleteOne,
} from "@/resources/controllers/factory.handler.controller";
import * as dotenv from "dotenv";

dotenv.config();

/*
 * @route GET api/v1/mobile/users/:id/likes
 * @desc get all liked articles of a user
 * @ascess private
 */

const getLikes = getAll(Like);

/*
 * @route POST api/v1/mobile/articles:articleId/likes
 * @desc post a like
 * @ascess private
 */

const postLikePost = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    // get current user
    req.user = await currentUser(
      req.headers.authorization.split(" ")[1],
      String(process.env.JWT_SECRET)
    )();

    // create bookmark
    const newLike = await Like.create({
      article: req.params.id,
      likedBy: req.user.id,
    });

    res.status(201).json({
      status: `success`,
      data: {
        data: newLike,
      },
    });
  }
);

const getOneLike = getOne(Like);

/*
 * @route DEL api/v1/mobile/likes/:id
 * @desc unlike an article
 * @ascess private
 */

const deleteLikePost = deleteOne(Like);

export { getLikes, postLikePost, getOneLike, deleteLikePost };
