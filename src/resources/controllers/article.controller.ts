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
 * @route PATCH api/v1/mobile/articles/:id/like-toggle-unlike
 * @desc like/unlike an article
 * @ascess private
 */

const toggleArticleLikeUnlike = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    // get current user
    req.user = await currentUser(
      req.headers.authorization.split(" ")[1],
      String(process.env.JWT_SECRET)
    )();

    // get article
    const article = await Article.findById(req.params.id).select("likedBy");

    if (!article) {
      return next(
        new AppError(`Document with id: ${req.params.id} not found`, 404)
      );
    }

    // 1 - if article is not liked by user - then like
    if (!article.likedBy?.includes(req.user._id)) {
      // A - push user to like property
      await article.updateOne({
        $push: { likedBy: req.user.id },
      });
      // B - get updated article - so as to get number of likes
      const getUpdatedArticle = await Article.findById(req.params.id).select(
        "likedBy"
      );

      // C - set number of likes to updated article
      await getUpdatedArticle?.updateOne({
        noOfLikes: getUpdatedArticle.likedBy?.length,
      });

      res.status(200).json({
        status: `success`,
        message: `Article now liked`,
      });
    } else {
      // 2 - if article is already liked by user - then unlike
      // A - remove user to like property
      await article.updateOne({
        $pull: { likedBy: req.user.id },
      });

      // B - get updated article - so as to get number of likes
      const getUpdatedArticle = await Article.findById(req.params.id).select(
        "likedBy"
      );

      // C - set number of likes to updated article
      await getUpdatedArticle?.updateOne({
        noOfLikes: getUpdatedArticle.likedBy?.length,
      });

      res.status(200).json({
        status: `success`,
        message: `Article now unliked`,
      });
    }
  }
);

/*
 * @route PATCH api/v1/mobile/articles/:id/likes
 * @desc get no of likes of article
 * @ascess private
 */

const getLikesOfAnArticle = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // load aggregate pipeline
    const articleLikes = await Article.getLikesOfArticles(req.params.id);

    // populate likedBy property
    const populateArticleLikes = await Article.populate(articleLikes, {
      path: "author likedBy",
      select: { fullName: 1, headline: 1 },
    });

    res.status(200).json({
      status: `success`,
      result: articleLikes.length,
      totalDoc: await Article.countDocuments(),
      data: {
        data: populateArticleLikes,
      },
    });
  }
);

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
  toggleArticleLikeUnlike,
  getLikesOfAnArticle,
  removeArticlePhoto,
  deleteArticle,
};
