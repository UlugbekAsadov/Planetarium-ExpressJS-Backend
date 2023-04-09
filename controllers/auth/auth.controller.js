const User = require("../../models/user.model");
const uuid = require("uuid");
const ErrorResponse = require("../../utils/error-response");
const asyncHandler = require("../../middlewares/async");
const { ERROR_MESSAGES } = require("../../utils/error-messages");
const { SUCCESS_MESSAGES } = require("../../utils/success-messages");

// @desc     Register new user
// @route    POST /api/v1/auth/register
// @access   Public
exports.register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  const apiKey = uuid.v4();

  const token = user.generateJwtToken();

  const user = await User.create({
    firstName,
    lastName,
    password,
    email,
    apiKey,
    token,
  });

  res.status(201).json({
    success: true,
    data: user,
  });
});

// @desc     Login user
// @route    POST /api/v1/auth/login
// @access   Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("Please provide email and password", 400));
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse(ERROR_MESSAGES.InvalidCredintials, 401));
  }

  //  Check for password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse(ERROR_MESSAGES.InvalidCredintials, 401));
  }

  const token = await user.generateJwtToken();

  res.status(200).json({
    success: true,
    data: user,
    token,
  });
});

// @desc     Get profile
// @route    POST /api/v1/auth/getProfile
// @access   Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  res.status(200).json({ success: true, data: user });
});

// @desc     Update profile
// @route    PUT /api/v1/auth/updateProfile
// @access   Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  const fieldsToUpdate = {
    firstName: req.body.firstName || user.firstName,
    lastName: req.body.lastName || user.lastName,
    email: req.body.email || user.email,
  };

  const updatedUser = await User.findByIdAndUpdate(userId, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: updatedUser,
    message: SUCCESS_MESSAGES.Updated,
  });
});
