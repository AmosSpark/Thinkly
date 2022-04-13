import { Request, Response, NextFunction } from "express";

import currentUser from "@/utils/current-usser.utils";
import byctypt from "bcrypt";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import { createSendToken } from "@/middleware/token.middleware";
import catchAsync from "@/utils/catch-async.utils";
import AppError from "@/utils/app-error.utils";
import User from "@/resources/models/user.model";
import {
  IUserLogin,
  IChangePassword,
} from "@/resources/interfaces/user.interface";
import * as dotenv from "dotenv";

dotenv.config();

/*
 * @route POST /api/v1/mobile/signup
 * @desc register new user
 * @ascess public
 */

const createNewUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // create user
    const newUser = await User.create(req.body);

    createSendToken(newUser, 201, res);
  }
);

/*
 * @route POST /api/v1/mobile/login
 * @desc login a user
 * @ascess public
 */

const logUserIn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const login: IUserLogin = req.body;
    // check if email || password is passed
    if (!login.email || !login.password) {
      return next(new AppError(`Please provide email and password`, 400));
    }

    // check if user exist
    const user = await User.findOne({
      email: login.email,
    }).select("+password");

    // comppare passwords
    if (!user || !(await byctypt.compare(login.password, user.password!))) {
      return next(new AppError(`Incorrect email or password`, 401));
    }
    createSendToken(user, 200, res);
  }
);

/*
 * @route GET /api/v1/mobile/user/change-password
 * @desc change password of a looged in user
 * @ascess private
 */

const changePassword = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    // get user
    const JWT_SECRET = String(process.env.JWT_SECRET);
    const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) return err;
      const user = await User.findById(decoded.id);
      req.user = user;

      const passwordChange: IChangePassword = req.body;

      const foundUser: any = await User.findById(req.user.id).select(
        "+password"
      );

      // validate password

      if (
        !user ||
        !(await byctypt.compare(
          passwordChange.currentPassword,
          foundUser.password!
        ))
      ) {
        return next(
          new AppError(`Your current password is wrong. Try again`, 401)
        );
      }

      // set new password and save
      foundUser.password = passwordChange.newPassword;
      await foundUser.save();

      // login and send JWT
      createSendToken(foundUser, 200, res);

      next();
    });
  }
);

/*
 * @route GET /api/v1/mobile/logout
 * @desc logout a user
 * @ascess private
 */

const logUserOut = (req: Request, res: Response) => {
  res.cookie("jwt", "loggeduserout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: `success`,
    message: `User logged out`,
  });
};

/*
 * @desc protect private routes
 */

const protectRoute = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    // check tokem / get token
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError(`Please login first`, 401));
    }

    // verify token
    const JWT_SECRET = String(process.env.JWT_SECRET);
    // @ts-ignore
    const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
    // @ts-ignore
    const freshUser = await User.findById(decoded.id);

    if (!freshUser) {
      return next(new AppError(`This user no longer exist`, 401));
    }
    // GRANT USER ACCESS TO PROTECTED ROUTE
    req.user = freshUser;
    res.locals.user = freshUser;
    next();
  }
);

/*
 * @desc restric protected routes
 */

const restrictTo = (...roles: string[]) => {
  return async (req: Request | any, res: Response, next: NextFunction) => {
    // get current user
    req.user = await currentUser(
      req.headers.authorization.split(" ")[1],
      String(process.env.JWT_SECRET)
    )();

    // check for roles
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

export {
  createNewUser,
  logUserIn,
  changePassword,
  logUserOut,
  protectRoute,
  restrictTo,
};
