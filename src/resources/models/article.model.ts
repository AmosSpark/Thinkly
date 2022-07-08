import { Schema, model, Query } from "mongoose";

import {
  IArticleDocument,
  IArticleModel,
} from "@/resources/interfaces/article.interface";
import mongoose from "mongoose";

const ArticleSchema: Schema = new Schema(
  {
    title: {
      type: String,
      minlength: [1, "Post must have a title"],
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: [
          "ENTERTAINMENT",
          "INTERNET",
          "GAMES",
          "SOCIETY",
          "WOMAN",
          "EDUCATION",
        ],
        message:
          "Category '{VALUE}' is not available. Category should be either: entertainment, internet, games, society, woman, or education",
      },
      required: [true, "Category is required"],
      trim: true,
      uppercase: true,
    },
    photo: {
      type: String,
    },
    photoId: {
      type: String,
    },
    body: {
      type: String,
      required: [true, "Cannot publish an empty article"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    likedBy: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
      select: false,
    },
    noOfLikes: {
      type: Number,
      default: 0,
    },
    noOfComments: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.id;
        delete ret.__v;
      },
    },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

// Populate - author with article

ArticleSchema.pre<Query<IArticleDocument, IArticleDocument>>(
  /^find/,
  function (next: Function) {
    this.populate({
      path: "author",
      select: "fullName headline",
    });
    next();
  }
);

// Virtual Population

/*
 * @desc poputate comments when
 * 'api/v1/articles/:id' is queried
 */

ArticleSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "article",
  localField: "_id",
});

// Agregate Pipeline

ArticleSchema.statics.getLikesOfArticles = async function (articleId) {
  return await this.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(articleId) },
    },
    {
      $project: {
        likedBy: 1,
      },
    },
  ]);
};

// Get begining date of a new week

const getBeginningOfTheWeek = (now: any) => {
  const days = (now.getDay() + 7 - 1) % 7;
  now.setDate(now.getDate() - days);
  now.setHours(0, 0, 0, 0);
  return now;
};

/*
 * @desc get weekly trending articles
 * 'api/v1/articles/articles-trending-this-week'
 */

ArticleSchema.statics.getWeeklyTrending = async function () {
  const trendingArticles = await this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: getBeginningOfTheWeek(new Date()),
        },
      },
    },
    {
      $sort: { noOfComments: -1 },
    },
    {
      $project: {
        body: 0,
        updatedAt: 0,
        __v: 0,
      },
    },
    {
      $limit: 10,
    },
  ]);

  await this.populate(trendingArticles, {
    path: "author",
    select: "fullName headliness",
  });

  return trendingArticles;
};

export default model<IArticleDocument, IArticleModel>("Article", ArticleSchema);
