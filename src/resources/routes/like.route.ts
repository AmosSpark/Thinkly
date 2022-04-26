import { Router, Express } from "express";

import { protectRoute } from "@/resources/controllers/auth.controller";

import {
  getLikePost,
  postLikePost,
  getOneLike,
  deleteLikePost,
} from "@/resources/controllers/like.controller";

const likesRouter = Router({ mergeParams: true }) as Express;

likesRouter.use(protectRoute); // protect all routes below

likesRouter.route("/").get(getLikePost).post(postLikePost);

likesRouter.route("/:id").get(getOneLike).delete(deleteLikePost);

export { likesRouter };
