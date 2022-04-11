import { Router, Express } from "express";

import {
  protectRoute,
  restrictTo,
} from "@/resources/controllers/auth.controller";

import {
  getComments,
  postComment,
  getOneComment,
  updateComment,
  deleteComment,
} from "@/resources/controllers/comment.controller";

const commentsRouter = Router({ mergeParams: true }) as Express;

commentsRouter
  .route("/")
  .get(protectRoute, restrictTo("admin"), getComments)
  .post(protectRoute, restrictTo("user", "admin"), postComment);

commentsRouter
  .route("/:id")
  .get(protectRoute, getOneComment)
  .patch(protectRoute, restrictTo("user", "admin"), updateComment)
  .delete(protectRoute, restrictTo("user", "admin"), deleteComment);

export { commentsRouter };
