import { Router, Express } from "express";

import {
  protectRoute,
  restrictTo,
} from "@/resources/controllers/auth.controller";

import {
  getLikes,
  postLikePost,
  getOneLike,
  deleteLikePost,
} from "@/resources/controllers/like.controller";

const likesRouter = Router({ mergeParams: true }) as Express;

likesRouter.use(protectRoute); // protect all routes below

likesRouter.route("/").get(restrictTo("admin"), getLikes).post(postLikePost);


likesRouter
  .route("/:id")
  .get(restrictTo("admin"), getOneLike)
  .delete(deleteLikePost);

likesRouter.route("/:id").delete(deleteLikePost);

export { likesRouter };
