import { Router, Express } from "express";

import {
  createNewUser,
  logUserIn,
  logUserOut,
  protectRoute,
  restrictTo,
} from "@/resources/controllers/auth.controller";

import {
  getAllUser,
  getUserProfile,
  getAuser,
  updateAuser,
  deleteAuser,
} from "@/resources/controllers/user.controller";

const usersRouter = Router() as Express;

usersRouter.route("/auth/signup").post(createNewUser);
usersRouter.route("/auth/login").post(logUserIn);

// protect all routes below - allow only loggedin users

usersRouter.route("/auth/logout").get(protectRoute, logUserOut);
usersRouter.route("/users/me").get(protectRoute, getUserProfile, getAuser);

// restrict below routes to admin only

usersRouter.route("/users").get(protectRoute, restrictTo("admin"), getAllUser);

usersRouter
  .route("/users/:id")
  .get(protectRoute, restrictTo("admin"), getAuser)
  .patch(protectRoute, restrictTo("admin"), updateAuser)
  .delete(protectRoute, restrictTo("admin"), deleteAuser);

export { usersRouter };
