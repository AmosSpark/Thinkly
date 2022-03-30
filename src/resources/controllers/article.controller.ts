import { Response, Request, NextFunction } from "express";

import jwt from "jsonwebtoken";
import catchAsync from "@/utils/catch-async.utils";
import AppError from "@/utils/app-error.utils";
import Article from "@/resources/models/article.model";
import User from "@/resources/models/user.model";
import {
  getAll,
  getOne,
  updateOne,
  deleteOne,
} from "@/resources/controllers/factory.handler.controller";
import * as dotenv from "dotenv";

dotenv.config();

/*
 * @route GET api/v1/mobile/articles
 * @desc get all article
 * @ascess public
 */

const getArticles = getAll(Article, { path: "noOfComments" });

/*
 * @route GET api/v1/mobile/articles/:id
 * @desc get an article
 * @ascess public
 */

const getOneArticle = getOne(Article, {
  path: "noOfComments author comments",
  select: "fullName headline createdAt updatedAt comment",
});

/*
 * @route POST api/v1/mobile/articles
 * @desc post new article
 * @ascess private
 */

const postArticle = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    // get user
    const JWT_SECRET = String(process.env.JWT_SECRET);
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) return err;
      const user = await User.findById(decoded.id);
      req.user = user;

      try {
        // create article
        const newArticle = await Article.create({
          title: req.body.title,
          category: req.body.category,
          body: req.body.body,
          author: req.user.id,
        });

        return res.status(201).json({
          status: `success`,
          data: {
            data: newArticle,
          },
        });
      } catch (error: any) {
        console.log(error);
        return next(new AppError(error.message, 400));
      }
      next();
    });
  }
);

/*
 * @route PATCH api/v1/mobile/articles/:id
 * @desc update an article
 * @ascess private
 */

const updateArticle = updateOne(Article);

/*
 * @route DELETE api/v1/mobile/articles/:id
 * @desc delete an article
 * @ascess private
 */

const deleteArticle = deleteOne(Article);

export {
  getArticles,
  getOneArticle,
  postArticle,
  updateArticle,
  deleteArticle,
};
