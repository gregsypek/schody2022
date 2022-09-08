const multer = require('multer');
const sharp = require('sharp');
const Price = require('../models/priceModel');
const AppError = require('../utils/appError');

const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('To nie zdjęcie!. Proszę udostępniać tylko zdjęcia', 400),
      false
    );
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPriceImage = upload.single('imageCover');
// upload.array('images',5) // if more than one

exports.resizePriceImage = catchAsync(async (req, res, next) => {
  // console.log(req.file);

  if (!req.file) return next();

  // req.body.imageCover = `price-${req.params.id ? req.params.id : ''}${
  //   req.params.id ? '-' : ''
  // }${Date.now()}.jpeg`;
  req.body.imageCover = `price-${
    req.params.id ? req.params.id : req.file.originalname.split('.')[0]
  }-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(800, 600)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/images/price/${req.body.imageCover}`);

  next();
});

// exports.deletePrice = async (req, res, next) => {
//   try {
//     await Price.findByIdAndDelete(req.params.id);
//     res.status(204).json({
//       data: null,
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: err,
//     });
//   }
// };

exports.getAllPrice = factory.getAll(Price);
exports.createPrice = factory.createOne(Price);

//Don't update passwords with this
exports.updatePrice = factory.updateOne(Price);
exports.deletePrice = factory.deleteOne(Price);
