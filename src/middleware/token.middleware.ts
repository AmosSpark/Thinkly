import * as jwt from "jsonwebtoken";

import * as dotenv from "dotenv";
import { Types } from "mongoose";
import ICookieOptions from "@/resources/interfaces/cookie.interface";

dotenv.config();

const signToken = (id: Types.ObjectId): string => {
  return jwt.sign({ id }, String(process.env.JWT_SECRET), {
    expiresIn: String(process.env.JWT_EXPIRES_IN),
  });
};

const createSendToken = (
  user: string | any,
  statusCode: number,
  res: object | any
) => {
  // create token
  const token: string = signToken(user._id);

  // send token via cookie

  const cookieOptions: ICookieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000 // hrs * min * sec * millisecs - to conver to millisecs
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // response

  user.password = undefined; // remove password from response

  res.status(statusCode).json({
    status: `success`,
    token,
    data: {
      data: user,
    },
  });
};

export { createSendToken };
