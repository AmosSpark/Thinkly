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
  removeUserProfilePhoto,
  getAuser,
  deactivateMyAccount,
} from "@/resources/controllers/user.controller";

import uploadPhoto from "@/utils/multer.utils";

const usersRouter = Router() as Express;

usersRouter.route("/auth/signup").post(createNewUser);
usersRouter.route("/auth/login").post(logUserIn);

usersRouter.use(protectRoute); // protect all routes below - allow only loggedin users

usersRouter.route("/auth/logout").get(logUserOut);
usersRouter.route("/users/me").get(getUserProfile, getAuser);

usersRouter.route("/users/me/change-password").patch(changePassword);

usersRouter.route("/users/me/update-me").patch(uploadPhoto, updateUserProfile);
usersRouter
  .route("/users/me/remove-profile-photo")
  .patch(removeUserProfilePhoto);

usersRouter.route("/users/me/deactivate-account").delete(deactivateMyAccount);

usersRouter.route("/users/:id").get(getAuser);

export { usersRouter };
