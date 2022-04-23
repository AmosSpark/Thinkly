import { Router, Express } from "express";

import { protectRoute } from "@/resources/controllers/auth.controller";

import {
  getArticles,
  getArticlesTrendingThisWeek,
  getOneArticle,
  postArticle,
  updateArticle,
  deleteArticle,
} from "@/resources/controllers/article.controller";

import { commentsRouter } from "@/resources/routes/comment.route";
import { bookmarksRouter } from "@/resources/routes/bookmark.route";
import { likesRouter } from "@/resources/routes/like.route";

const articlesRouter = Router() as Express;

articlesRouter.route("/").post(protectRoute, postArticle).get(getArticles);

articlesRouter
  .route("/articles-trending-this-week")
  .get(getArticlesTrendingThisWeek);

articlesRouter
  .route("/:id")
  .get(getOneArticle)
  .patch(protectRoute, updateArticle)
  .delete(protectRoute, deleteArticle);

// /api/v1/mobile/articles:articleId/comments
articlesRouter.use("/:id/comments", protectRoute, commentsRouter);
// /api/v1/mobile/articles:articleId/bookmarks
articlesRouter.use("/:id/bookmarks", protectRoute, bookmarksRouter);
// /api/v1/mobile/articles:articleId/likes
articlesRouter.use("/:id/likes", protectRoute, likesRouter);

export { articlesRouter };
