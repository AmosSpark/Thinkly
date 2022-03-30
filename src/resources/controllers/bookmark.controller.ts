import { Response, Request, NextFunction } from "express";

import jwt from "jsonwebtoken";
import catchAsync from "@/utils/catch-async.utils";
import AppError from "@/utils/app-error.utils";
import User from "@/resources/models/user.model";
import Bookmark from "@/resources/models/bookmark.model";
import {
  getAll,
  getOne,
  updateOne,
  deleteOne,
} from "@/resources/controllers/factory.handler.controller";
import * as dotenv from "dotenv";

dotenv.config();

/*
 * @route GET api/v1/mobile/bookmarks
 * @desc get all bookmarks
 * @ascess private
 */

const getBookmarks = getAll(Bookmark);

/*
 * @route POST api/v1/mobile/articles:articleId/bookmarks
 * @desc post a bookmark
 * @ascess private
 */

const postBookmark = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    // get user
    const JWT_SECRET = String(process.env.JWT_SECRET);
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) return err;
      const user = await User.findById(decoded.id);
      req.user = user;

      try {
        // create bookmark
        const newBookmark = await Bookmark.create({
          article: req.params.id,
          bookmarkedBy: req.user.id,
        });

        return res.status(201).json({
          status: `success`,
          data: {
            data: newBookmark,
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
 * @route GET api/v1/mobile/bookmarks/:id
 * @desc get a bookmark
 * @ascess private
 */

const getOneBookmark = getOne(Bookmark, {
  path: "bookmarkedBy",
  select: "fullName",
});

/*
 * @route DEL api/v1/mobile/bookmarks/:id
 * @desc delete a bookmark
 * @ascess private
 */

const deleteBookmark = deleteOne(Bookmark);

export { getBookmarks, postBookmark, getOneBookmark, deleteBookmark };
