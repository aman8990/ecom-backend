const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Email = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    // secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    secure: true,
    sameSite: 'none',
    path: '/',
  });

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
  const { name, email, phone, password } = req.body;

  const existingUser = await User.findOne({ email });
  // console.log(existingUser);
  if (existingUser) {
    if (!existingUser.active) {
      const verificationToken = existingUser.createVerificationToken();

      existingUser.name = name;
      existingUser.phone = phone;
      existingUser.password = password;
      await existingUser.save({ validateBeforeSave: false });

      const verificationUrl = `http://127.0.0.1:5173/verifyEmail?token=${verificationToken}`;

      await new Email(existingUser, verificationUrl).sendVerificationEmail();

      res.status(200).json({
        status: 'success',
        message: 'A verification email has been sent',
        // verificationUrl,
      });
    }

    return next(new AppError('Email already in use', 400));
  }

  const newUser = await User.create({
    name,
    email,
    phone,
    password,
  });

  const verificationToken = newUser.createVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  const verificationUrl = `http://127.0.0.1:5173/verifyEmail?token=${verificationToken}`;

  await new Email(newUser, verificationUrl).sendVerificationEmail();

  res.status(200).json({
    status: 'success',
    message: 'A verification email has been sent',
    verificationUrl,
  });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  const { token } = req.body;

  if (!token) {
    return next(new AppError('Token is missing', 400));
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    signupToken: hashedToken,
    signupExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.active = true;
  user.signupToken = undefined;
  user.signupExpires = undefined;
  await user.save();

  createSendToken(user, 200, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password +active');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!user.active) {
    const verificationToken = user.createVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verificationUrl = `http://127.0.0.1:5173/verifyEmail?token=${verificationToken}`;

    await new Email(user, verificationUrl).sendVerificationEmail();

    return next(
      new AppError('Verification link has been sent to your email', 401),
    );
  }

  createSendToken(user, 200, req, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    // secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    secure: true,
    sameSite: 'none',
    path: '/',
  });
  res.status(200).json({ status: 'success' });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
    // console.log('Token:', token);

    if (!token) {
      return next(
        new AppError('You are not logged in. Please login to get access', 401),
      );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user no longer exist', 401));
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('user recently changed password. Please login again'),
      );
    }

    req.user = currentUser;

    res.locals.user = currentUser;
  }
  next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next(new AppError('No user found with this ID', 401));
      }

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
          new AppError(
            'User recently changed password! Please log in again.',
            401,
          ),
        );
      }

      res.locals.user = currentUser;
      return res.status(200).json({
        status: 'success',
        currentUser,
      });
    } catch (err) {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
  }

  return res.status(400).json({
    status: 'error',
    message: 'No JWT found. User is not logged in.',
  });
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  // console.log(req.user);
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  user.password = req.body.password;
  await user.save();

  createSendToken(user, 200, req, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetUrl = `http://127.0.0.1:5173/resetPassword?token=${resetToken}`;

    await new Email(user, resetUrl).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Verification link has been sent to your email',
      resetUrl,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the token. Please try again'),
    );
  }
});

exports.validateResetToken = catchAsync(async (req, res, next) => {
  const { token } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  res.status(200).json({
    status: 'success',
    message: 'Token is valid',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, req, res);
});
