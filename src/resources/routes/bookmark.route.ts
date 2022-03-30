import { Router, Express } from "express";

import {
  protectRoute,
  restrictTo,
} from "@/resources/controllers/auth.controller";

import {
  getBookmarks,
  postBookmark,
  getOneBookmark,
  deleteBookmark,
} from "@/resources/controllers/bookmark.controller";

const bookmarksRouter = Router({ mergeParams: true }) as Express;

bookmarksRouter
  .route("/")
  .get(protectRoute, restrictTo("admin"), getBookmarks)
  .post(protectRoute, restrictTo("user", "admin"), postBookmark);

bookmarksRouter
  .route("/:id")
  .get(protectRoute, restrictTo("user", "admin"), getOneBookmark)
  .delete(protectRoute, restrictTo("user", "admin"), deleteBookmark);

export { bookmarksRouter };
