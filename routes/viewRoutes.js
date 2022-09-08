const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

//TODO CHECK IF THIS MIDDLEWARE IS NECCESSARY FOR ALL ROUTES. COLLISION WITH PROTECT ROUTE
router.use(authController.isLoggedIn);

router.get('/', viewController.getHomePage);
router.get('/overview', viewController.getOverview);
router.get('/stairs/:slug', viewController.getStairs);

router.get('/price', viewController.getPrice);
router.get('/contact', viewController.getContact);
router.get('/login', viewController.getLoginForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/setPrice', authController.protect, viewController.getPriceForm);
router.get('/setStairs', authController.protect, viewController.getStairsForm);
router.get('/addPhoto', authController.protect, viewController.getAddPhotoForm);
router.get(
  '/deletePhoto',
  authController.protect,
  viewController.getDeletePhotoForm
);

// router.post(
//   '/multiple-upload',
//   uploadController.uploadImages,
//   uploadController.resizeImages
// );
// router.post(
//   '/addPhoto',
//   uploadController.uploadImages,
//   uploadController.resizeImages
// );
// router.post(
//   '/price',
//   authController.restrictTo('admin'),
//   viewController.getPriceForm
// );

module.exports = router;
