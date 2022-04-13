import { Response, Request, NextFunction } from "express";

import currentUser from "@/utils/current-usser.utils";
import catchAsync from "@/utils/catch-async.utils";
import Article from "@/resources/models/article.model";
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

const getArticles = getAll(Article);

/*
 * @route GET api/v1/mobile/articles/articles-trending-this-week
 * @desc get top 10 trending articles
 * @ascess public
 */

const getArticlesTrendingThisWeek = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const articlesThisWeek = await Article.getWeeklyTrending();

    // check if there're new articles trending
    if (articlesThisWeek.length === 0) {
      res.status(200).json({
        status: `success`,
        message: `There are no new articles trending`,
      });
    }

    res.status(200).json({
      status: `success`,
      result: articlesThisWeek.length,
      totalDoc: await Article.countDocuments(),
      data: {
        data: articlesThisWeek,
      },
    });
  }
);

/*
 * @route GET api/v1/mobile/articles/:id
 * @desc get an article
 * @ascess public
 */

const getOneArticle = getOne(Article, {
  path: "comments",
});

/*
 * @route POST api/v1/mobile/articles
 * @desc post new article
 * @ascess private
 */

const postArticle = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    // get current user
    req.user = await currentUser(
      req.headers.authorization.split(" ")[1],
      String(process.env.JWT_SECRET)
    )();

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
  getArticlesTrendingThisWeek,
  getOneArticle,
  postArticle,
  updateArticle,
  deleteArticle,
};
