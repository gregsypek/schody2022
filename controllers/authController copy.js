const crypto = require('crypto');
const { promisify } = require('util'); // util is built in Node
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  //Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1 Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Proszę podać email oraz hasło', 400));
  }
  //2 Check if user exists && password is correct
  const user = await User.findOne({ email: email }).select('+password'); //include password as well

  //if user doesn't exist the right side will not run
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(`Nieprawidłowy email lub hasło`, 401));
  }
  //3 If everything ok , send token to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
exports.protect = catchAsync(async (req, res, next) => {
  //1. Getting token and check of it's there

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // console.log(token);
  if (!token)
    return next(
      new AppError(
        'Nie jesteś zalogowany! Zaloguj się aby otrzymać dostęp',
        401
      )
    );
  //2. Verification token
  //  jwt.verify(token, secretOrPublicKey, [options, callback])
  // (Asynchronous) If a callback is supplied, function acts asynchronously. The callback is called with the decoded payload if the signature is valid and optional expiration, audience, or issuer are valid. If not, it will be called with the error.
  // (Synchronous) If a callback is not supplied, function acts synchronously. Returns the payload decoded if the signature is valid and optional expiration, audience, or issuer are valid. If not, it will throw the error.
  // token is the JsonWebToken string
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);
  //3. Check if user still exit;
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('Uzytkownik z tym tokenem juz nie istnieje', 401));
  }
  //4. Check if user changed password after the token was issued.
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'Uzytkonwik ostatnio zmienił hasło. Proszę zaloguj się pononwnie',
        401
      )
    );
  }
  //GRANT ACCESS TO PROTECTED ROUTE
  // this request object,
  // this is the one that travels, basically,
  // from middleware to middleware.
  // And so, if we want to pass data
  // from one middleware to the next one,
  // then we can simply put some stuff on the request object,
  // and then that data will be available at a later point.
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

//Only for rendered pages, no errors NO CATCHASYNC NO NEED TO SEND ERROR GLOBAL
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1)verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //2. Check if user still exists;
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      //3. Check if user changed password after the token was issued.
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      //There is a logged in user
      res.locals.user = currentUser;
      //make that user accessible to our templates.
      return next();
    } catch (err) {
      return next();
    }
  }

  next();
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    //roles ['admin']
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Nie masz uprawnień', 403));
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on POSTED email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('Nie ma uzytkownika z takim adresem email', 404));
  //2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3) Send it to user's email
  //   here we actually gotta send
  // the plain, original resetToken, and not the encrypted one.
  // All right?
  // We will then, in the next step,
  // compare the original token with the encrypted one.
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Zapomniałeś hasła? Wypełnij formularz z nowym hasłem oraz jego potwierdzeniem tutaj: ${resetURL}.\nJezeli nie zapomniałeś hasła, zignoruj tą wiadomość`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Twój token do zresetowania hasła (wazny tylko 10 minut',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('Wystąpił problem z wysłaniem emaila. Spróbuj ponownie', 500)
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on the token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2) If token has not expired and there is user, set the new password
  if (!user) {
    return next(new AppError('Token jest niewazny lub wygasł', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3)Update changedPasswordAt property for the user
  //4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  //2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('Twoje hasło jest nieprawidłowe', 400));

  //3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();
  //Iser/findByIdAndUpdate will NOT work as intended
  //4) Log user in, send JWT
  createSendToken(user, 200, res);
});
