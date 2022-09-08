// const { router } = require('../app');
// const path = require('path');
const fs = require('fs');
// const { unlink } = require('fs/promises');
const multer = require('multer');
const sharp = require('sharp');
const Stair = require('../models/stairModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();
// const multerStorage = multer.diskStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('To nie zdjęcie!. Proszę udostępnić tylko zdjęcia', 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadStairImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
exports.uploadNewPhotos = upload.fields([{ name: 'images', maxCount: 3 }]);

exports.resizeStairImages = catchAsync(async (req, res, next) => {
  // console.log('tutaj', req.files.images);

  if (!req.files.imageCover || !req.files.images) return next();

  // 1 Cover image
  req.body.imageCover = `stairs-${Date.now()} - cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/images/stairs/${req.body.imageCover}`);

  //2 Images

  req.body.images = `stairs-${Date.now()} - image.jpeg`;
  await sharp(req.files.images[0].buffer)
    .resize(800, 800)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/images/stairs/${req.body.images}`);

  // console.log(req.body);
  // console.log('req.body.images', req.body.images);

  next();
});
exports.uploadStairImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeNewPhotos = catchAsync(async (req, res, next) => {
  // console.log('tutaj', req.files.images);

  if (!req.files.images) return next();

  //2 Images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `stairs-${Date.now()} - ${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(800, 800)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/stairs/${filename}`);
      req.body.images.push(filename);
    })
  );

  // console.log(req.body);
  // console.log('req.body.images', req.body.images);

  next();
});

exports.deleteImageFromStairs = catchAsync(async (req, res, next) => {
  // console.log('body', req.body);
  // console.log('req.params', req.params);

  const doc = await Stair.update(
    { _id: req.params.id },
    { $pull: { images: { $in: [req.params.name] } } },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!doc) {
    return next(new AppError('Nie ma takiego dokumentu', 404));
  }

  // await fs.unlink(`public/images/stairs/${req.params.name}`, (err) => {
  //   if (err) throw err;
  //   console.log('Zdjecie usuniete');
  // });

  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
  //  TODO CHECK IF THIS E IF STATEMENT IS RIGHT
  // const newUrl = `${req.originalUrl}`.split('/').slice(0, 5).join('/');
  if (res.statusCode === 200) {
    await fs.unlink(`public/images/stairs/${req.params.name}`, (err) => {
      if (err) throw err;
      console.log('Zdjecie usuniete');
      // window.location.reload(true);
      // res.redirect('back');
    });
  }

  // newUrl = [newUrl].join('/');
  // console.log('new', newUrl);
  // console.log('hello', req.originalUrl, typeof req.originalUrl);
  // await res.redirect();
  // console.log('res', res.statusCode);
});

exports.getAllStairs = factory.getAll(Stair);

exports.getStair = factory.getOne(Stair);

exports.createStair = factory.createOne(Stair);

exports.updateStair = factory.updateOne(Stair);

exports.deleteStair = factory.deleteOne(Stair);
