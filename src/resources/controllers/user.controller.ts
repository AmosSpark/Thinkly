import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";
import User from "@/resources/models/user.model";
import {
  getAll,
  getOne,
  updateOne,
  deleteOne,
} from "@/resources/controllers/factory.handler.controller";

/*
 * @route GET api/v1/mobile/users
 * @desc get all user
 * @ascess private
 */

const getAllUser = getAll(User);

/*
 * @route GET api/v1/mobile/users/:id
 * @desc get all user
 * @ascess private
 */

const getAuser = getOne(User);

/*
 * @route GET api/v1/mobile/users/me
 * @desc get profile of current user
 * @ascess private
 */

const getUserProfile = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
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
};

/*
 * @route PATCH api/v1/mobile/users/:id
 * @desc update user information
 * @ascess private
 */

const updateAuser = updateOne(User);

/*
 * @route POST api/v1/mobile/users/id
 * @desc delete user
 * @ascess private
 */

const deleteAuser = deleteOne(User);

export { getAllUser, getAuser, getUserProfile, updateAuser, deleteAuser };
