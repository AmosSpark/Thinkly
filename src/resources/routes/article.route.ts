import { Router, Express } from "express";

import {
  protectRoute,
  restrictTo,
} from "@/resources/controllers/auth.controller";

import {
  getArticles,
  getOneArticle,
  postArticle,
  updateArticle,
  deleteArticle,
} from "@/resources/controllers/article.controller";

import { commentsRouter } from "@/resources/routes/comment.route";

const articlesRouter = Router() as Express;

articlesRouter
  .route("/")
  .post(protectRoute, restrictTo("user", "admin"), postArticle)
  .get(getArticles);

articlesRouter
  .route("/:id")
  .get(getOneArticle)
  .patch(protectRoute, restrictTo("user", "admin"), updateArticle)
  .delete(protectRoute, restrictTo("user", "admin"), deleteArticle);

// /api/v1/mobile/articles:articleId/comments
articlesRouter.use("/:id/comments", protectRoute, commentsRouter);

export { articlesRouter };
