import { Router, Express } from "express";

import {
  protectRoute,
  restrictTo,
} from "@/resources/controllers/auth.controller";

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

const articlesRouter = Router() as Express;

articlesRouter
  .route("/")
  .post(protectRoute, restrictTo("user", "admin"), postArticle)
  .get(getArticles);

articlesRouter
  .route("/articles-trending-this-week")
  .get(getArticlesTrendingThisWeek);

articlesRouter
  .route("/:id")
  .get(getOneArticle)
  .patch(protectRoute, restrictTo("user", "admin"), updateArticle)
  .delete(protectRoute, restrictTo("user", "admin"), deleteArticle);

// /api/v1/mobile/articles:articleId/comments
articlesRouter.use("/:id/comments", protectRoute, commentsRouter);
// /api/v1/mobile/articles:articleId/bookmarks
articlesRouter.use("/:id/bookmarks", protectRoute, bookmarksRouter);

export { articlesRouter };
