import { Response, Request, NextFunction } from "express";

import { Model } from "mongoose";
import catchAsync from "@/utils/catch-async.utils";
import AppError from "@/utils/app-error.utils";
import QueryFeatures from "@/utils/query.features";

/*
 * @desc create one document
 */

const createOne = (Model: Model<any>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: `success`,
      data: {
        data: doc,
      },
    });
  });

/*
 * @desc get all document
 */

const getAll = (Model: Model<any>, popOptions?: any) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // To allow for nested GET coments on article
    let filter = {};
    if (req.params.id) filter = { article: req.params.id };
    // Execute query
    const queryFeatures = new QueryFeatures(
      Model.find(filter).populate(popOptions),
      req.query
    )
      .filter()
      .sort()
      .limitFileds()
      .paginate();

    const doc = await queryFeatures.query;

    // set page number

    let pageNo: string;

    const totalPage: number = Math.ceil((await Model.countDocuments()) / 10);

    req.query.page
      ? (pageNo = req.query.page + "/" + String(totalPage))
      : (pageNo = "1" + "/" + String(totalPage));

    return res.status(200).json({
      status: `success`,
      page: pageNo,
      results: doc.length,
      totalDoc: await Model.countDocuments(),
      data: {
        data: doc,
      },
    });
  });

/*
 * @desc get one document
 */

const getOne = (Model: Model<any>, popOptions?: any) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // implement access control
    // 1 - Select document
    const id = req.params.id;
    const doc = await Model.findById(id);
    // 2- validate
    if (!doc) {
      return next(new AppError(`Document with id: ${id} not found`, 404));
    }

    if (doc.bookmarkedBy) {
      if (
        String(doc.bookmarkedBy._id) !== req.user.id &&
        req.user.role != "admin"
      ) {
        return next(
          new AppError(
            `Unauthorized Request: You can only get your own bookmark`,
            401
          )
        );
      }
    }

    // get document

    let query = Model.findById(doc.id);
    if (popOptions) query = query.populate(popOptions);
    const getDoc = await query;

    return res.status(200).json({
      status: `success`,
      data: {
        data: getDoc,
      },
    });
  });

/*
 * @desc update one document
 */

const updateOne = (Model: Model<any>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // implement access control
    // 1 - Select document
    const id = req.params.id;
    const doc = await Model.findById(id);
    // 2- validate
    if (!doc) {
      return next(new AppError(`Document with id: ${id} not found`, 404));
    }

    if (doc.commentBy) {
      if (doc.commentBy.id !== req.user.id && req.user.role != "admin") {
        return next(
          new AppError(
            `Unauthorized Request: You can only update your own comment`,
            401
          )
        );
      }
    } else if (doc.body) {
      if (doc.author.id !== req.user.id && req.user.role != "admin") {
        return next(
          new AppError(
            `Unauthorized Request: You can only update your own article`,
            401
          )
        );
      }
    }

    // update document

    const body = req.body;

    const updateDoc = await Model.findByIdAndUpdate(doc.id, body, {
      new: true,
      runValidator: true,
    });

    res.status(200).json({
      status: `success`,
      data: {
        data: updateDoc,
      },
    });
  });

/*
 * @desc delete one document
 */

const deleteOne = (Model: Model<any>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // implement access control
    // 1 - Select document
    const id = req.params.id;
    const doc = await Model.findById(id);
    // 2- validate
    if (!doc) {
      return next(new AppError(`Document with id: ${id} not found`, 404));
    }

    if (doc.commentBy) {
      if (doc.commentBy.id !== req.user.id && req.user.role != "admin") {
        return next(
          new AppError(
            `Unauthorized Request: You can only delete your own comment`,
            401
          )
        );
      }
    } else if (doc.bookmarkedBy) {
      if (
        String(doc.bookmarkedBy._id) !== req.user.id &&
        req.user.role != "admin"
      ) {
        return next(
          new AppError(
            `Unauthorized Request: Ysou can only delete your own bookmark`,
            401
          )
        );
      }
    } else if (doc.body) {
      if (doc.author.id !== req.user.id && req.user.role != "admin") {
        return next(
          new AppError(
            `Unauthorized Request: You can only delete your own article`,
            401
          )
        );
      }
    }

    // delete document

    await Model.findByIdAndDelete(doc.id);

    res.status(204).json();
  });

export { createOne, getAll, getOne, updateOne, deleteOne };
