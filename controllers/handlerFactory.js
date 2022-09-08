const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('Nie ma dokumentu z tym ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (req.files) console.log(req.body);

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('Nie ma takiego dokumentu', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError('Nie ma takiej usługi', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
// only use it when you have to populate
// exports.getOne = (Model, popOptions) =>
//   catchAsync(async (req, res, next) => {
//     let query = Model.findById(req.params.id);
//     if (popOptions) query = query.populate(popOptions);
//     const doc = await query;
//     if (!doc) {
//       return next(new AppError('Nie ma takiej usługi', 404));
//     }
//     res.status(200).json({
//       status: 'success',
//       data: {
//         doc,
//       },
//     });
//   });
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on stair (hack)
    // let filter = {};
    // if (req.params.stairId) filter = { stair: req.params.stairId };

    // const features = new APIFeatures(Model.find(filter), req.query).filter().sort();
    const features = new APIFeatures(Model.find(), req.query).filter().sort();
    // .limitFields();

    // const doc = await features.query.explain();
    const doc = await features.query;
    // const doc = await Model.find();
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
