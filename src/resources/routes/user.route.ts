import { Router, Express } from "express";

import {
  createNewUser,
  logUserIn,
  logUserOut,
  protectRoute,
} from "@/resources/controllers/auth.controller";

const usersRouter = Router() as Express;

usersRouter.route("/auth/signup").post(createNewUser);
usersRouter.route("/auth/login").post(logUserIn);

// protect all routes below
usersRouter.use(protectRoute);

usersRouter.route("/auth/logout").get(logUserOut);

export { usersRouter };
