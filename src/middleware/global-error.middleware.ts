import { Request, Response, NextFunction } from "express";

import AppError from "@/utils/app-error.utils";

/*
 * @desc global error handler middleware response
 */

// database cast errors
const handleDBCastError = (error: any) => {
  const message = `Invalid path: ${error.path} / value: ${error.value}`;
  return new AppError(message, 400);
};

// database duplicate fields errors
const handleDBDuplicateFields = (error: any) => {
  const fieldObject = error.keyValue;
  let filedName;
  let fiedValue;

  for (const x in fieldObject) {
    filedName = x;
    fiedValue = fieldObject[x];
  }

  const message = `Duplicate path: '${filedName}' with value: '${fiedValue}' detected, please use a unique value`;
  return new AppError(message, 400);
};

// database validation error
const handleDBValidationError = (error: any) => {
  const errors = Object.values(error.errors).map((e: any): string => e.message);

  const message = `${errors.join(". ")}`;
  return new AppError(message, 400);
};

// database query/request value error
const handleDDBadRequestValue = (error: any) => {
  return new AppError(error.message, 400);
};

// jwt error

const handleJWTError = () => {
  return new AppError("Invalid token. Please log in again!", 401);
};

const handleJWTExpiredError = () => {
  return new AppError("Your token has expired! Please log in again.", 401);
};

// cloudinary error

const handleConnectCloudinaryError = () => {
  return new AppError(
    "Unable to upload photo! Please check your internet or try again.",
    500
  );
};

const handleStaleCloudinaryRequestError = () => {
  return new AppError("Old request! Please try again.", 500);
};

// development response
const sendErrDev = (error: any, res: Response) => {
  res.status(error.statusCode).json({
    status: error.status,
    error,
    message: error.message,
    stack: error.stack,
  });
};

// production response
const sendErrProd = (error: any, res: Response) => {
  if (error.isOperational) {
    // Known error
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    // Unknown error
    console.error(`Error:`, error);

    res.status(500).json({
      status: `error`,
      message: `Something went wrong`,
    });
  }
};

const globalError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || `error`;

  if (process.env.NODE_ENV === "development") {
    sendErrDev(error, res);
  } else if (process.env.NODE_ENV === "production" || "test") {
    // handle error types
    if (error.name === "CastError") error = handleDBCastError(error);
    if (error.code === 11000) error = handleDBDuplicateFields(error);
    if (error.name === "ValidationError")
      error = handleDBValidationError(error);
    if (error.code === 2) error = handleDDBadRequestValue(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    if (error.hostname === "api.cloudinary.com" && error.errno === -3008)
      error = handleConnectCloudinaryError();
    if (error.http_code === 400 && error.name === "Error")
      error = handleStaleCloudinaryRequestError();

    sendErrProd(error, res);
  }
};

export default globalError;
