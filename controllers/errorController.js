const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Niewłaściwy ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // const value = err.keyValue.name;
  const value = Object.values(err.keyValue)[0];
  const message = `Wartość ${value} juz istnieje. Proszę uzyć innej`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Niewłaściwa wartość. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Niewłaściwy token, Proszę zaloguj się jeszcze raz!', 401);

const handleJWTExpiredError = () =>
  new AppError('Twój token wygasł! Zaloguj się ponownie', 401);

const sendErrorDev = (err, req, res) => {
  //API
  //originalUrl is basically entire url but not with the host so looks exactly like the route
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  //RENDERED WEBSITE
  console.error('ERRRORR', err);
  return res.status(err.statusCode).render('error', {
    title: 'Coś poszło nie tak!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    //Operational, trusted error - send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERRRORR', err);

    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Coś poszło nie tak!',
    });
  }
  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Coś poszło nie tak!',
      msg: err.message,
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Cos poszło nie tak!',
    msg: 'Spróbuj ponownie później!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // let error = { ...err };
    let error = Object.create(err);
    error.message = err.message;
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
