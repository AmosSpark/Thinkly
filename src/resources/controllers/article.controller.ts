import { Response, Request, NextFunction } from "express";

import { cloudinary, uploadPhotoToCloudinary } from "@/utils/cloudinary.utils";
import currentUser from "@/utils/current-usser.utils";
import catchAsync from "@/utils/catch-async.utils";
import AppError from "@/utils/app-error.utils";
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

    const newArticle = new Article({
      title: req.body.title,
      category: req.body.category,
      photo: "",
      photoId: "",
      body: req.body.body,
      author: req.user.id,
    });

    // upload article photo
    if (req.file) {
      const result = await uploadPhotoToCloudinary(req.file.buffer, "Articles");
      newArticle.photo = result.secure_url;
      newArticle.photoId = result.public_id.slice(9);
    }

    // save new article
    await newArticle.save();

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
 * @route PATCH api/v1/mobile/articles/:id/remove-photo
 * @desc remove article photo
 * @ascess private
 */

const removeArticlePhoto = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    // get article document
    let article = await Article.findById(req.params.id);

    if (!article) {
      return next(
        new AppError(`Document with id: ${req.params.id} not found`, 404)
      );
    }

    // Implement access-control
    if (article.author) {
      if (article.author.id !== req.user.id && req.user.role != "admin") {
        return next(
          new AppError(
            `Forbiden Request: You can only delete photo of your own article`,
            403
          )
        );
      }
    }

    // remove article photo from cloudinary
    const removePhoto = await cloudinary.uploader.destroy(
      `Articles/${article.photoId}`
    );

    //  reset article default photo
    if (removePhoto) {
      const body = {
        photo: "",
        photoId: "",
      };

      article = await Article.findByIdAndUpdate(req.params.id, body, {
        new: true,
        runValidators: true,
      });
    }

    res.status(200).json({
      data: {
        status: `success`,
        data: article,
      },
    });
  }
);

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
  removeArticlePhoto,
  deleteArticle,
};
