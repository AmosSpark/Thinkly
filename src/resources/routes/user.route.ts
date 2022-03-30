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

// protect all routes below
usersRouter.use(protectRoute);

usersRouter.route("/auth/logout").get(logUserOut);
usersRouter.route("/users/me").get(getUserProfile, getAuser);

// restrict below routes to admin only
usersRouter.use(restrictTo("admin"));

usersRouter.route("/users").get(getAllUser);

usersRouter
  .route("/users/:id")
  .get(getAuser)
  .patch(updateAuser)
  .delete(deleteAuser);

export { usersRouter };
