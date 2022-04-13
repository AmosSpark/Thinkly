import { Router, Express } from "express";

import {
  protectRoute,
  restrictTo,
} from "@/resources/controllers/auth.controller";

import {
  getAllUser,
  updateAuser,
  deleteAuser,
} from "@/resources/controllers/user.controller";

import { getComments } from "@/resources/controllers/comment.controller";
import { getBookmarks } from "@/resources/controllers/bookmark.controller";

const adminRouter = Router() as Express;

adminRouter.use(protectRoute, restrictTo("admin")); // protect all routes below & permit only admins

adminRouter.route("/users").get(getAllUser);

adminRouter.route("/users/:id").patch(updateAuser).delete(deleteAuser);

adminRouter.route("/comments").get(getComments);

adminRouter.route("/bookmarks").get(getBookmarks);

export { adminRouter };
