import { Request, Response, NextFunction } from "express";

import {
  cloudinary,
  userDefaultPhoto,
  uploadPhotoToCloudinary,
} from "@/utils/cloudinary.utils";
import currentUser from "@/utils/current-usser.utils";
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
    // get current user
    req.user = await currentUser(
      req.headers.authorization.split(" ")[1],
      String(process.env.JWT_SECRET)
    )();
    // set params to user id
    req.params.id = req.user.id;

    next();
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

    // get current user
    req.user = await currentUser(
      req.headers.authorization.split(" ")[1],
      String(process.env.JWT_SECRET)
    )();

    // update document
    // 1 - only allow field names that should be updated
    const filteredBody: object = filterFields(
      req.body,
      "fullName",
      "email",
      "photo",
      "photoId",
      "headline",
      "bio"
    );

    if (req.file) {
      // upload user photo
      const result = await uploadPhotoToCloudinary(req.file.buffer, "Users");
      // @ts-ignore: Property 'photo' does not exist on type 'object'
      filteredBody.photo = result.secure_url;
      // @ts-ignore: Property 'photo' does not exist on type 'object'
      filteredBody.photoId = result.public_id.slice(6);
    }

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
  }
);

/*
 * @route DELETE api/v1/mobile/users/me/remove-profile-photo
 * @desc remove profile photo of user
 * @ascess private (user)
 */

const removeUserProfilePhoto = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    // get current user
    req.user = await currentUser(
      req.headers.authorization.split(" ")[1],
      String(process.env.JWT_SECRET)
    )();

    // get user document
    let user = await User.findById(req.user.id);

    // remove user photo from cloudinary
    const removePhoto = await cloudinary.uploader.destroy(
      `Users/${req.user.photoId}`
    );
    //  reset user default photo
    if (removePhoto) {
      const body = {
        photo: userDefaultPhoto,
        photoId: "",
      };

      user = await User.findByIdAndUpdate(req.user.id, body, {
        new: true,
        runValidators: true,
      });
    }

    res.status(200).json({
      data: {
        status: `success`,
        data: user,
      },
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
    // get current user
    req.user = await currentUser(
      req.headers.authorization.split(" ")[1],
      String(process.env.JWT_SECRET)
    )();
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
  }
);

export {
  getAllUser,
  getAuser,
  getUserProfile,
  updateUserProfile,
  removeUserProfilePhoto,
  updateAuser,
  deleteAuser,
  deactivateMyAccount,
};
