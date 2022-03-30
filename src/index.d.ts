import { Request } from "express";
import { Query } from "mongoose";

declare namespace Express {
  export interface Request {
    user: any;
  }
  export interface Response {
    user: any;
  }
}
