import { Response, Request, NextFunction } from "express";

import currentUser from "@/utils/current-usser.utils";
import catchAsync from "@/utils/catch-async.utils";
import Bookmark from "@/resources/models/bookmark.model";
import {
  getAll,
  getOne,
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
    // get current user
    req.user = await currentUser(
      req.headers.authorization.split(" ")[1],
      String(process.env.JWT_SECRET)
    )();

    // create bookmark
    const newBookmark = await Bookmark.create({
      article: req.params.id,
      bookmarkedBy: req.user.id,
    });

    res.status(201).json({
      status: `success`,
      data: {
        data: newBookmark,
      },
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
