import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";
import User from "@/resources/models/user.model";
import {
  getAll,
  getOne,
  updateOne,
  deleteOne,
} from "@/resources/controllers/factory.handler.controller";
import { IChangePassword } from "@/resources/interfaces/user.interface";
import AppError from "@/utils/app-error.utils";
import catchAsync from "@/utils/catch-async.utils";

/*
 * @route GET api/v1/mobile/users
 * @desc get all user
 * @ascess private
 */

const getAllUser = getAll(User, {
  path: "noOfArticles noOfBookmarks noOfComments",
});

/*
 * @route GET api/v1/mobile/users/:id
 * @desc get all user
 * @ascess private
 */

const getAuser = getOne(User, {
  path: "noOfArticles noOfBookmarks noOfComments articles bookmarks",
  select: "title category createdAt",
});

/*
 * @route GET api/v1/mobile/users/me
 * @desc get profile of current user
 * @ascess private
 */

const getUserProfile = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    // get user
    const JWT_SECRET = String(process.env.JWT_SECRET);
    const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) return err;
      const user = await User.findById(decoded.id);
      req.user = user;
      // assign id to params
      req.params.id = req.user.id;
      next();
    });
  }
);

/*
 * @route PATCH api/v1/mobile/users/me/update-profile
 * @desc update user information
 * @ascess private (user)
 */

// 1 - filter update fileds

const filterFields = (obj: object | any, ...allowedFields: string[]) => {
  const newObj: object | any = {};

  Object.keys(obj).forEach((el: string) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// 2 - implement allowed fields in updateUserProfile handler

const updateUserProfile = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const passwordChange: IChangePassword = req.body;
    // do not allow for password change
    if (
      req.body.password ||
      (passwordChange.currentPassword && passwordChange.newPassword)
    ) {
      return next(
        new AppError(
          `This route is not for password update. Please use /me/change-password`,
          400
        )
      );
    }

    // get user
    const JWT_SECRET = String(process.env.JWT_SECRET);
    const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) return err;
      const user = await User.findById(decoded.id);
      req.user = user;

      // update document
      // 1 - only allow field names that should be updated
      const filteredBody: object = filterFields(
        req.body,
        "fullName",
        "email",
        "headline",
        "bio"
      );
      // 2 - validate and update
      const foundUserAndUpdate = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
          new: true,
          runValidators: true,
        }
      );

      res.status(200).json({
        data: {
          status: `success`,
          data: foundUserAndUpdate,
        },
      });

      next();
    });
  }
);

/*
 * @route PATCH api/v1/mobile/users/:id
 * @desc update user information
 * @ascess private (admin)
 */

const updateAuser = updateOne(User);

/*
 * @route POST api/v1/mobile/users/id
 * @desc delete user
 * @ascess private
 */

const deleteAuser = deleteOne(User);

/*
 * @route POST api/v1/mobile/users/me/deactivate-account
 * @desc deactivate account
 * @ascess private
 */

const deactivateMyAccount = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    // get user
    const JWT_SECRET = String(process.env.JWT_SECRET);
    const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) return err;
      const user = await User.findById(decoded.id);
      req.user = user;
      // deactivate found user
      await User.findByIdAndUpdate(req.user.id, {
        active: false,
      });

      res.status(204).json({
        data: {
          status: `success`,
          data: null,
        },
      });

      next();
    });
  }
);

export {
  getAllUser,
  getAuser,
  getUserProfile,
  updateUserProfile,
  updateAuser,
  deleteAuser,
  deactivateMyAccount,
};
