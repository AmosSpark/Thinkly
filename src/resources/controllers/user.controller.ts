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
      if (req.user.photoId !== "") {
        // remove previous photo
        // @ts-ignore: Property 'photoId' does not exist on type 'object'
        await cloudinary.uploader.destroy(`Users/${req.user.photoId}`);
      }
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
 * @route PATCH api/v1/mobile/users/:id/follow-toggle-unfollow
 * @desc follow/unfollow a user
 * @ascess private
 */

var setFollowingAndFollwersCount: () => any;

const toggleFollowUnfollowUser = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    // get current user
    req.user = await currentUser(
      req.headers.authorization.split(" ")[1],
      String(process.env.JWT_SECRET)
    )();

    // target user
    const userToFollowOrUnfollow = await User.findById(req.params.id).select(
      "fullName followers"
    );

    // current user
    const currentUserDoc = await User.findById(req.user.id).select("following");

    if (!userToFollowOrUnfollow) {
      return next(
        new AppError(`Document with id: ${req.params.id} not found`, 404)
      );
    }

    // do not allow current user to follow self
    if (req.params.id === req.user.id) {
      return next(
        new AppError(`Unauthorized Request: You cannot follow yourself`, 403)
      );
    }

    if (!userToFollowOrUnfollow.followers?.includes(req.user.id)) {
      // 1-  if currentUser not following a target user - follow
      // A - push currentuser to property 'followers' of userToFollowOrUnFollow
      await userToFollowOrUnfollow.updateOne({
        $push: { followers: req.user.id },
      });

      // B - push userToFollowOrUnFollow to property 'following' of currentUser
      await currentUserDoc?.updateOne({
        $push: { following: req.params.id },
      });

      // set following/follwers count function
      setFollowingAndFollwersCount = async () => {
        // C - get updated userToFolloOrUnfllow - so as to get number of followers
        const getUpdatedUserToFollowOrUnfollow = await User.findById(
          req.params.id
        ).select("followers");

        // D - get updated currentUserDoc - so as to get number of following
        const getUpdatedCurrentUserDoc = await User.findById(
          req.user._id
        ).select("following");

        // E - set number of followers to updated userToFolloOrUnfllow
        await getUpdatedUserToFollowOrUnfollow?.updateOne({
          followersCount: getUpdatedUserToFollowOrUnfollow.followers?.length,
        });

        // F - set number of following to updated currentUserDoc
        await getUpdatedCurrentUserDoc?.updateOne({
          followingCount: getUpdatedCurrentUserDoc.following?.length,
        });
      };

      res.status(200).json({
        status: `success`,
        message: `Now following ${userToFollowOrUnfollow.fullName}`,
      });
    } else {
      // 2 - if currentUser already following a target user - unfollow
      // A - pull currentuser from property 'followers' of userToFollowOrUnFollow
      await userToFollowOrUnfollow.updateOne({
        $pull: { followers: req.user.id },
      });
      // B - pull userToFollowOrUnFollow from property 'following' of currentUser
      await currentUserDoc?.updateOne({
        $pull: { following: req.params.id },
      });

      // set following/follwers count function
      setFollowingAndFollwersCount;

      res.status(200).json({
        status: `success`,
        message: `Now unfollowing ${userToFollowOrUnfollow.fullName}`,
      });
    }
  }
);

/*
 * @route GET api/v1/mobile/users/:id/followers
 * @desc get user followers
 * @ascess private
 */

const getFollowers = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const userFollowers = await User.getFollowers(req.params.id);

    // if user does not exist
    if (userFollowers.length === 0) {
      return next(
        new AppError(`Document with id: ${req.params.id} not found`, 404)
      );
    }

    // populate followers property
    const populateUserFollowers = await User.populate(userFollowers, {
      path: "followers",
      select: { fullName: 1, photo: 1, headline: 1, bio: 1 },
    });

    // get user followers so as to set length of result
    const user = await User.findById(req.params.id).select("followers");

    res.status(200).json({
      status: `success`,
      result: user?.followers?.length,
      totalDoc: await User.countDocuments(),
      data: {
        data: populateUserFollowers,
      },
    });
  }
);

/*
 * @route GET api/v1/mobile/users/:id/following
 * @desc get user following
 * @ascess private
 */

const getFollowing = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const userFollowing = await User.getFollowing(req.params.id);

    // if user does not exist
    if (userFollowing.length === 0) {
      return next(
        new AppError(`Document with id: ${req.params.id} not found`, 404)
      );
    }

    // populate following property
    const populateUserFollowing = await User.populate(userFollowing, {
      path: "following",
      select: { fullName: 1, photo: 1, headline: 1, bio: 1 },
    });

    // get user following so as to set length of result
    const user = await User.findById(req.params.id).select("following");

    res.status(200).json({
      status: `success`,
      result: user?.following?.length,
      totalDoc: await User.countDocuments(),
      data: {
        data: populateUserFollowing,
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
  toggleFollowUnfollowUser,
  getFollowers,
  getFollowing,
  updateAuser,
  deleteAuser,
  deactivateMyAccount,
};
