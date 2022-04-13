import { Request, Response } from "express";

declare global {
  namespace Express {
    export interface Request {
      user?: any;
    }
    export interface Response {
      user?: any;
    }
  }
}
