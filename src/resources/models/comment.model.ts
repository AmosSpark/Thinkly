import { Schema, model, Query } from "mongoose";

import ICommentDocument from "@/resources/interfaces/comment.interface";
import Article from "@/resources/models/article.model";

const CommentSchema: Schema = new Schema(
  {
    article: {
      type: Schema.Types.ObjectId,
      ref: "Article",
    },
    comment: {
      type: String,
      required: [true, "Cannot post an empty comment"],
    },
    commentBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

// Populate - comment with article

CommentSchema.pre<Query<ICommentDocument, ICommentDocument>>(
  /^find/,
  function (next: Function) {
    this.populate({
      path: "commentBy",
      select: "fullName createdAt",
    });
    next();
  }
);

// Comment Count

// 1 - Calc. number of comments of an article when a comment is submitted

CommentSchema.statics.calcTotalComments = async function (articleId) {
  const stats = await this.aggregate([
    {
      $match: { article: articleId },
    },
    {
      $group: {
        _id: "article",
        nComment: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    // update article
    await Article.findByIdAndUpdate(articleId, {
      noOfComments: stats[0].nComment,
    });
  } else {
    // set to default
    await Article.findByIdAndUpdate(articleId, {
      noOfComments: 0,
    });
  }
};

CommentSchema.post("save", function () {
  // points to current comment
  this.constructor.calcTotalComments(this.article);
});

// 2 - Calc. number of comments of an article when a comment is updated/deleted

CommentSchema.pre<Query<ICommentDocument, ICommentDocument>>(
  /^findOneAnd/,
  async function (next: Function) {
    // @ts-ignore: igore property doc does not exist on type Query...
    this.doc = await this.clone().findOne();
    next();
  }
);

CommentSchema.post<Query<ICommentDocument, ICommentDocument>>(
  /^findOneAnd/,
  async function () {
    // @ts-ignore: igore property doc does not exist on type Query...
    await this.doc.constructor.calcTotalComments(this.doc.article);
  }
);

export default model<ICommentDocument>("Comment", CommentSchema);
