const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const ContactUs = require('../models/contactusModel');
const Order = require('../models/orderModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`img/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = catchAsync(async (req, res, next) => {
  const query = User.findById(req.params.id);
  const doc = await query;

  if (!doc) {
    return next(new AppError('No document find with that id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    return next(new AppError('This route is not for password updates.', 400));
  }

  const {
    locality,
    city,
    district,
    state,
    pincode,
    name,
    email,
    photo,
    phone,
  } = req.body;

  const update = {};

  if (name !== undefined) update.name = name;
  if (email !== undefined) update.email = email;
  if (phone !== undefined) update.phone = phone;
  if (photo !== undefined) update.photo = photo;

  if (locality) update.address = { locality, city, district, state, pincode };

  const updatedUser = await User.findByIdAndUpdate(req.user.id, update, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.contactUs = catchAsync(async (req, res, next) => {
  const { name, email, phone, subject, description } = req.body;

  const newContact = await ContactUs.create({
    name,
    email,
    phone,
    subject,
    description,
  });

  res.status(200).json({
    status: 'success',
    newContact,
  });
});

exports.getUserOrders = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const orders = await Order.find({ userId })
    .populate({
      path: 'items.productId',
      select: 'name',
    })
    .sort({ createdAt: -1 });

  if (!orders) return next(new AppError('No orders found,404'));

  res.status(200).json({
    status: 'success',
    orders: orders,
  });
});

exports.getUserOrder = catchAsync(async (req, res, next) => {
  const data = req.body;
  const userId = req.user.id;

  const userOrder = await Order.find({
    _id: data,
    userId: userId,
  }).populate({
    path: 'items.productId',
    select: 'name',
  });

  if (!userOrder.length) return next(new AppError('No order found', 404));

  res.status(200).json({
    status: 'success',
    userOrder,
  });
});
