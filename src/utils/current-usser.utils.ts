import { promisify } from "util";

import jwt from "jsonwebtoken";
import User from "@/resources/models/user.model";

const currentUser = (token: any, JWT_SECRET: string) => async () => {
  // @ts-ignore
  const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
  // @ts-ignore
  const user = await User.findById(decoded.id);
  return user;
};

export default currentUser;
