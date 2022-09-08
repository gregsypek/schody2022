const Stair = require('../models/stairModel');
const Price = require('../models/priceModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getHomePage = (req, res) => {
  res.status(200).render('home', {
    title: 'Schody Zaliński',
  });
};

exports.getOverview = catchAsync(async (req, res, next) => {
  //1 Get stair data from collection
  const stairs = await Stair.find();
  //2 Build template

  //3 Render that template using stair data from 1

  res.status(200).render('overview', {
    title: 'Nasza oferta',
    stairs,
  });
});
exports.getStairs = catchAsync(async (req, res, next) => {
  const stairs = await Stair.findOne({ slug: req.params.slug });

  if (!stairs) {
    return next(new AppError('Nie ma takiej usługi', 404));
  }

  res.status(200).render('stairs', {
    title: `${stairs.name}`,
    stairs,
  });
});
exports.getPrice = catchAsync(async (req, res, next) => {
  const price = await Price.find();

  res.status(200).render('price', {
    title: 'Cennik',
    price,
  });
});
exports.getContact = catchAsync(async (req, res) => {
  res.status(200).render('contact', {
    title: 'Kontakt',
  });
});

exports.getLoginForm = (req, res, next) => {
  res.status(200).render('login', {
    title: 'Zaloguj się',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Twoje konto',
  });
};
exports.getPriceForm = catchAsync(async (req, res, next) => {
  const price = await Price.find();
  res.status(200).render('setPrice', {
    title: 'Twoje konto',
    price,
  });
});
exports.getStairsForm = catchAsync(async (req, res, next) => {
  const stairs = await Stair.find();
  res.status(200).render('setStairs', {
    title: 'Twoje konto',
    stairs,
  });
});
exports.getAddPhotoForm = catchAsync(async (req, res, next) => {
  const stairs = await Stair.find();
  res.status(200).render('addPhoto', {
    title: 'Dodaj zdjęcie',
    stairs,
  });
});
exports.getDeletePhotoForm = catchAsync(async (req, res, next) => {
  const stairs = await Stair.find();
  // const stairsSelected = await Stair.findOne({ __id: req.params.id });
  res.status(200).render('deletePhoto', {
    title: 'Usuń zdjęcie',
    stairs,
    // stairsSelected,
  });
});
// exports.getDeleteParams = catchAsync(async (req, res, next) => {
//   const photo = await Stair.findOne({
//     id: req.params.id,
//     index: req.params.index,
//   });
//   res.status(200).render('deletePhoto', {
//     title: 'Usuń zdjęcie',
//     photo,
//   });
// });
