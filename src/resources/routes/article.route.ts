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

const articlesRouter = Router() as Express;

articlesRouter
  .route("/articles")
  .post(protectRoute, restrictTo("user", "admin"), postArticle)
  .get(getArticles);

articlesRouter
  .route("/articles/:id")
  .get(getOneArticle)
  .patch(protectRoute, restrictTo("user", "admin"), updateArticle)
  .delete(protectRoute, restrictTo("user", "admin"), deleteArticle);

export { articlesRouter };
