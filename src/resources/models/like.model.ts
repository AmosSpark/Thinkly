import { Schema, model, Query } from "mongoose";

import uniqueValidator from "mongoose-unique-validator";
import ILikeDocument from "@/resources/interfaces/like.interface";
import Article from "@/resources/models/article.model";

const LikeSchema: Schema = new Schema(
  {
    article: {
      type: Schema.Types.ObjectId,
      ref: "Article",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now(),
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
  }
);

// Avoid duplicate like by a user

LikeSchema.index({ likedBy: 1 }, { unique: true });

LikeSchema.plugin(uniqueValidator, {
  message: "You already liked this article",
});

// Populate - user and article

LikeSchema.pre(/^find/, function (next: Function) {
  this.populate({
    path: "article",
    select: "-author -body -createdAt -updatedAt -noOfComments -noOfLikes",
  }).populate({
    path: "likedBy",
    select: "fullName",
  });
  next();
});

// Like Count

// 1 - Calc. number of likes of an article when a user like the article

LikeSchema.statics.calcTotalLikes = async function (articleId) {
  const stats = await this.aggregate([
    {
      $match: { article: articleId },
    },
    {
      $group: {
        _id: "article",
        nlike: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    // update article
    await Article.findByIdAndUpdate(articleId, {
      noOfLikes: stats[0].nlike,
    });
  } else {
    // set to default
    await Article.findByIdAndUpdate(articleId, {
      noOfLikes: 0,
    });
  }
};

LikeSchema.post("save", function () {
  // points to current like
  this.constructor.calcTotalLikes(this.article);
});

// 2 - Calc. number of likes of an article when an article is unliked

LikeSchema.pre<Query<ILikeDocument, ILikeDocument>>(
  /^findOneAnd/,
  async function (next: Function) {
    // @ts-ignore: igore property doc does not exist on type Query...
    this.doc = await this.clone().findOne();
    next();
  }
);

LikeSchema.post<Query<ILikeDocument, ILikeDocument>>(
  /^findOneAnd/,
  async function () {
    // @ts-ignore: igore property doc does not exist on type Query...
    await this.doc.constructor.calcTotalLikes(this.doc.article);
  }
);

export default model<ILikeDocument>("Like", LikeSchema);
