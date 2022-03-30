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

const getAll = (Model: Model<any>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Execute query
    const queryFeatures = new QueryFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFileds()
      .paginate();

    const doc = await queryFeatures.query;

    return res.status(200).json({
      status: `success`,
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
    const id = req.params.id;
    let query = Model.findById(id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError(`Document with 'id': ${id} not found`, 404));
    }

    return res.status(200).json({
      status: `success`,
      data: {
        data: doc,
      },
    });
  });

/*
 * @desc update one document
 */

const updateOne = (Model: Model<any>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id,
      body = req.body;

    const doc = await Model.findByIdAndUpdate(id, body, {
      new: true,
      runValidator: true,
    });

    if (!doc) {
      return next(new AppError(`Document with 'id': ${id} not found`, 404));
    }

    res.status(200).json({
      status: `success`,
      data: {
        data: doc,
      },
    });
  });

/*
 * @desc delete one document
 */

const deleteOne = (Model: Model<any>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const doc = await Model.findByIdAndRemove(id);

    if (!doc) {
      return next(new AppError(`Document with id: ${id} not found`, 404));
    }

    res.status(204).json();
  });

export { createOne, getAll, getOne, updateOne, deleteOne };
