import { Router, Express } from "express";

import {
  createNewUser,
  logUserIn,
  changePassword,
  logUserOut,
  protectRoute,
} from "@/resources/controllers/auth.controller";

import {
  getUserProfile,
  updateUserProfile,
  getAuser,
  deactivateMyAccount,
} from "@/resources/controllers/user.controller";

const usersRouter = Router() as Express;

usersRouter.route("/auth/signup").post(createNewUser);
usersRouter.route("/auth/login").post(logUserIn);

usersRouter.use(protectRoute); // protect all routes below - allow only loggedin users

usersRouter.route("/auth/logout").get(logUserOut);
usersRouter.route("/users/me").get(getUserProfile, getAuser);

usersRouter.route("/users/me/change-password").patch(changePassword);

usersRouter.route("/users/me/update-me").patch(updateUserProfile);

usersRouter.route("/users/me/deactivate-account").delete(deactivateMyAccount);

usersRouter.route("/users/:id").get(getAuser);

export { usersRouter };
