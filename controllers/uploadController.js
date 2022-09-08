const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const Stair = require('../models/stairModel');

const multerStorage = multer.memoryStorage();

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

const uploadFiles = upload.array('images', 10);

const uploadImages = (req, res, next) => {
  uploadFiles(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return new AppError(
          'Za duzo zdjęć. Proszę załadować maksymalnie 10',
          400
        );
      }
    } else if (err) {
      return res.send(err);
    }

    next();
  });
};

const resizeImages = async (req, res, next) => {
  if (!req.files) return next();

  req.body.images = [];
  await Promise.all(
    req.files.map(async (file) => {
      const filename = file.originalname.replace(/\..+$/, '');
      const newFilename = `stairs-${filename}-${Date.now()}.jpeg`;

      await sharp(file.buffer)
        .resize(800, 800)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/stairs/${newFilename}`);

      req.body.images.push(newFilename);
    })
  );

  next();
};
const updateImages = async (req, res, next) => {
  // if (req.files) console.log(req.body);
  // console.log('body', req.body);
  // console.log('req.params', req.params);
  const doc = await Stair.findByIdAndUpdate(
    {
      _id: req.params.id,
    },
    { $push: { images: req.body.images } },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!doc) {
    return next(new AppError('Nie ma takiego dokumentu', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
};

// const getResult = async (req, res) => {
//   if (req.body.images.length <= 0) {
//     // return res.send(`You must select at least 1 image.`);
//     return new AppError('Musisz wybrac conajmniej jedno zdjęcie!', 204);
//   }

//   const images = req.body.images.map((image) => '' + image + '').join('');

//   console.log(images);

//   return res.send(`Images were uploaded:${images}`);
// };

module.exports = {
  uploadImages: uploadImages,
  resizeImages: resizeImages,
  updateImages: updateImages,
  // getResult: getResult,
};
