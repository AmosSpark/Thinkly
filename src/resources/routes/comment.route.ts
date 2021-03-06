import { Router, Express } from "express";

import { protectRoute } from "@/resources/controllers/auth.controller";

import {
  postComment,
  getComments,
  getOneComment,
  updateComment,
  deleteComment,
} from "@/resources/controllers/comment.controller";

const commentsRouter = Router({ mergeParams: true }) as Express;

commentsRouter.use(protectRoute); // protect all routes below - allow only loggedin users

commentsRouter.route("/").post(postComment).get(getComments);

commentsRouter
  .route("/:id")
  .get(getOneComment)
  .patch(updateComment)
  .delete(deleteComment);

export { commentsRouter };
