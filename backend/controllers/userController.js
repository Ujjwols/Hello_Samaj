const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/userModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { sendOTPController, verifyOTPController } = require("./otpController");
const { v4: uuidv4 } = require("uuid");
const { validateUserFiles } = require("../utils/fileValidation");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const cloudinary = require("cloudinary").v2;

// Generate refresh and access tokens
const generateAccessTokenAndRefreshToken = async (userId, rememberMe = false) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    const refreshTokenExpiry = rememberMe 
      ? Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
      : Date.now() + 24 * 60 * 60 * 1000; // 1 day
      
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = refreshTokenExpiry;

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken, refreshTokenExpiry };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(
      500,
      "Something went wrong while generating access token and refresh token"
    );
  }
};

// Register a new user
const registerUserController = asyncHandler(async (req, res) => {
  const { fullname, email, phoneNumber, password, city, wardNumber, tole, gender, dob, role, assignedWards } = req.body;

  const requiredFields = {
    fullname,
    email,
    phoneNumber,
    password,
    city,
    wardNumber,
    gender,
    dob,
  };

  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      throw new ApiError(400, `Field '${key}' is required`);
    }
  }

  if (!email.endsWith("@gmail.com")) {
    throw new ApiError(400, "Email must be a valid Gmail address");
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
  if (!passwordRegex.test(password)) {
    throw new ApiError(
      400,
      "Password must be at least 6 characters long and include at least one capital letter, one number, and one special character"
    );
  }

  if (!["Kathmandu", "Lalitpur", "Bhaktapur"].includes(city)) {
    throw new ApiError(400, "City must be Kathmandu, Lalitpur, or Bhaktapur");
  }

  const wardNum = parseInt(wardNumber);
  if (city === "Kathmandu" && (wardNum < 1 || wardNum > 32)) {
    throw new ApiError(400, "Ward number for Kathmandu must be between 1 and 32");
  }
  if (city === "Lalitpur" && (wardNum < 1 || wardNum > 29)) {
    throw new ApiError(400, "Ward number for Lalitpur must be between 1 and 29");
  }
  if (city === "Bhaktapur" && (wardNum < 1 || wardNum > 10)) {
    throw new ApiError(400, "Ward number for Bhaktapur must be between 1 and 10");
  }

  if (!["male", "female"].includes(gender.toLowerCase())) {
    throw new ApiError(400, "Gender must be male or female");
  }

  const dobDate = new Date(dob);
  if (isNaN(dobDate.getTime()) || dobDate > new Date()) {
    throw new ApiError(400, "Invalid date of birth");
  }

  if (role && !["user", "super_admin", "ward_admin"].includes(role)) {
    throw new ApiError(400, "Invalid role");
  }
  if (role === "ward_admin" && (!assignedWards || !Array.isArray(assignedWards) || assignedWards.length === 0)) {
    throw new ApiError(400, "Ward admins must have at least one assigned ward");
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { phoneNumber }],
  });

  if (existingUser) {
    throw new ApiError(400, "User already exists with this email or phone number");
  }

  validateUserFiles(req.files);

  let profilePicUrl = "";
  if (!req.files.profilePic) {
    throw new ApiError(400, "Profile picture is required");
  }
  try {
    const profilePicResult = await uploadOnCloudinary(
      req.files.profilePic[0].path,
      "User Profiles"
    );
    if (profilePicResult && profilePicResult.secure_url) {
      profilePicUrl = profilePicResult.secure_url;
    } else {
      throw new ApiError(500, "Failed to upload profile picture");
    }
  } catch (error) {
    throw new ApiError(500, `Profile picture upload failed: ${error.message}`);
  }

  let files = [];
  if (req.files.additionalFile) {
    try {
      const fileResult = await uploadOnCloudinary(
        req.files.additionalFile[0].path,
        "User Files"
      );
      if (fileResult && fileResult.secure_url) {
        files.push({
          url: fileResult.secure_url,
          type: req.files.additionalFile[0].mimetype,
        });
      } else {
        throw new ApiError(500, "Failed to upload additional file");
      }
    } catch (error) {
      throw new ApiError(500, `Additional file upload failed: ${error.message}`);
    }
  }

  const user = await User.create({
    ...requiredFields,
    username: fullname.toLowerCase().replace(/\s+/g, "_"),
    profilePic: profilePicUrl,
    files,
    tole: tole || "",
    gender: gender.toLowerCase(),
    dob: dobDate,
    role: role || "user",
    assignedWards: role === "ward_admin" ? assignedWards : [],
  });

  const { accessToken, refreshToken, refreshTokenExpiry } = await generateAccessTokenAndRefreshToken(user._id, false);
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Error while creating user");
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 24 * 60 * 60 * 1000,
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        201,
        { user: createdUser, accessToken, refreshToken },
        "User registered and logged in successfully"
      )
    );
});

// Send OTP for user login
const sendOTPVerificationLogin = asyncHandler(async (req, res) => {
  const { email, password, deliveryMethod } = req.body;

  if (!email || !password || !deliveryMethod) {
    throw new ApiError(400, "Email, password, and delivery method are required");
  }
  if (!["sms", "email"].includes(deliveryMethod)) {
    throw new ApiError(400, "Invalid delivery method. Use sms or email");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid password");
  }

  const identifier = deliveryMethod === "sms" ? user.phoneNumber : user.email;
  if (!identifier) {
    throw new ApiError(
      400,
      `User does not have a ${deliveryMethod === "sms" ? "phone number" : "email"} registered`
    );
  }

  try {
    const { token, identifier: returnedIdentifier, deliveryMethod: returnedMethod, message } =
      await sendOTPController({
        identifier,
        deliveryMethod,
      });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { token, identifier: returnedIdentifier, deliveryMethod: returnedMethod },
          message
        )
      );
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Failed to send OTP"
    );
  }
});

// Verify OTP for user login
const verifyUserOTPLogin = asyncHandler(async (req, res) => {
  const { token, otp, deliveryMethod, rememberMe } = req.body;

  if (!token || !otp || !deliveryMethod) {
    throw new ApiError(400, "Token, OTP, and delivery method are required");
  }
  if (!["sms", "email"].includes(deliveryMethod)) {
    throw new ApiError(400, "Invalid delivery method. Use sms or email");
  }

  try {
    const { identifier, message } = await verifyOTPController({
      token,
      otp,
      deliveryMethod,
    });

    const user = await User.findOne(
      deliveryMethod === "sms" ? { phoneNumber: identifier } : { email: identifier }
    );
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const { accessToken, refreshToken, refreshTokenExpiry } = await generateAccessTokenAndRefreshToken(user._id, rememberMe);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    };

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { loggedInUser, accessToken, refreshToken },
          "User logged in successfully"
        )
      );
  } catch (error) {
    console.error("Error in verifyUserOTPLogin:", error);
    throw error;
  }
});

// Send OTP for admin login
const sendAdminOTPVerificationLogin = asyncHandler(async (req, res) => {
  const { email, password, deliveryMethod } = req.body;

  if (!email || !password || !deliveryMethod) {
    throw new ApiError(400, "Email, password, and delivery method are required");
  }
  if (!["sms", "email"].includes(deliveryMethod)) {
    throw new ApiError(400, "Invalid delivery method. Use sms or email");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }
  if (!["super_admin", "ward_admin"].includes(user.role)) {
    throw new ApiError(403, "This endpoint is for admin users only");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid password");
  }

  const identifier = deliveryMethod === "sms" ? user.phoneNumber : user.email;
  if (!identifier) {
    throw new ApiError(
      400,
      `User does not have a ${deliveryMethod === "sms" ? "phone number" : "email"} registered`
    );
  }

  try {
    const { token, identifier: returnedIdentifier, deliveryMethod: returnedMethod, message } =
      await sendOTPController({
        identifier,
        deliveryMethod,
      });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { token, identifier: returnedIdentifier, deliveryMethod: returnedMethod },
          message
        )
      );
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Failed to send OTP"
    );
  }
});

// Verify OTP for admin login
const verifyAdminUserOTPLogin = asyncHandler(async (req, res) => {
  const { token, otp, deliveryMethod, rememberMe } = req.body;

  if (!token || !otp || !deliveryMethod) {
    throw new ApiError(400, "Token, OTP, and delivery method are required");
  }
  if (!["sms", "email"].includes(deliveryMethod)) {
    throw new ApiError(400, "Invalid delivery method. Use sms or email");
  }

  try {
    const { identifier, message } = await verifyOTPController({
      token,
      otp,
      deliveryMethod,
    });

    const user = await User.findOne(
      deliveryMethod === "sms" ? { phoneNumber: identifier } : { email: identifier }
    );
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (!["super_admin", "ward_admin"].includes(user.role)) {
      throw new ApiError(403, "This endpoint is for admin users only");
    }

    const { accessToken, refreshToken, refreshTokenExpiry } = await generateAccessTokenAndRefreshToken(user._id, rememberMe);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    };

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { loggedInUser, accessToken, refreshToken },
          "Admin logged in successfully"
        )
      );
  } catch (error) {
    console.error("Error in verifyAdminUserOTPLogin:", error);
    throw error;
  }
});

// Logout user
const logoutUserController = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new ApiError(400, "No refresh token found");
  }

  const user = await User.findOne({ refreshToken });
  if (user) {
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });
  }

  res
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Get all users (super_admin only)
const getAllUsersController = asyncHandler(async (req, res) => {
  if (req.user.role !== "super_admin") {
    throw new ApiError(403, "Only super admins can access this endpoint");
  }

  const users = await User.find().select("-password -refreshToken");

  if (!users || users.length === 0) {
    throw new ApiError(404, "No users found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users retrieved successfully"));
});

// Get user by ID
const getUserByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User retrieved successfully"));
});

// Update user by ID
const updateUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Check if the user is either a super_admin or the owner of the profile
  if (req.user.role !== "super_admin" && req.user._id.toString() !== id) {
    throw new ApiError(403, "You are not authorized to update this user");
  }

  delete updateData.password; // Prevent password updates through this endpoint
  delete updateData.refreshToken; // Prevent refresh token updates

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (req.files && (req.files.profilePic || req.files.additionalFile)) {
    validateUserFiles(req.files);

    if (req.files.profilePic) {
      try {
        if (user.profilePic) {
          const publicId = user.profilePic.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`User Profiles/${publicId}`);
        }
        const profilePicResult = await uploadOnCloudinary(
          req.files.profilePic[0].path,
          "User Profiles"
        );
        if (profilePicResult && profilePicResult.secure_url) {
          user.profilePic = profilePicResult.secure_url;
        } else {
          throw new ApiError(500, "Failed to upload profile picture");
        }
      } catch (error) {
        throw new ApiError(500, `Profile picture upload failed: ${error.message}`);
      }
    }

    if (req.files.additionalFile) {
      try {
        if (user.files.length > 0) {
          const publicId = user.files[0].url.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`User Files/${publicId}`);
        }
        const fileResult = await uploadOnCloudinary(
          req.files.additionalFile[0].path,
          "User Files"
        );
        if (fileResult && fileResult.secure_url) {
          user.files = [
            {
              url: fileResult.secure_url,
              type: req.files.additionalFile[0].mimetype,
            },
          ];
        } else {
          throw new ApiError(500, "Failed to upload additional file");
        }
      } catch (error) {
        throw new ApiError(500, `Additional file upload failed: ${error.message}`);
      }
    }
  }

  if (updateData.email && !updateData.email.endsWith("@gmail.com")) {
    throw new ApiError(400, "Email must be a valid Gmail address");
  }
  if (updateData.city && !["Kathmandu", "Lalitpur", "Bhaktapur"].includes(updateData.city)) {
    throw new ApiError(400, "City must be Kathmandu, Lalitpur, or Bhaktapur");
  }
  if (updateData.wardNumber) {
    const wardNum = parseInt(updateData.wardNumber);
    const city = updateData.city || user.city;
    if (city === "Kathmandu" && (wardNum < 1 || wardNum > 32)) {
      throw new ApiError(400, "Ward number for Kathmandu must be between 1 and 32");
    }
    if (city === "Lalitpur" && (wardNum < 1 || wardNum > 29)) {
      throw new ApiError(400, "Ward number for Lalitpur must be between 1 and 29");
    }
    if (city === "Bhaktapur" && (wardNum < 1 || wardNum > 10)) {
      throw new ApiError(400, "Ward number for Bhaktapur must be between 1 and 10");
    }
  }
  if (updateData.gender && !["male", "female"].includes(updateData.gender.toLowerCase())) {
    throw new ApiError(400, "Gender must be male or female");
  }
  if (updateData.dob) {
    const dobDate = new Date(updateData.dob);
    if (isNaN(dobDate.getTime()) || dobDate > new Date()) {
      throw new ApiError(400, "Invalid date of birth");
    }
    updateData.dob = dobDate;
  }

  // Prevent non-super_admins from updating role or assignedWards
  if (req.user.role !== "super_admin") {
    delete updateData.role;
    delete updateData.assignedWards;
  } else {
    // Super admin can update role and assignedWards, with validation
    if (updateData.role && !["user", "super_admin", "ward_admin"].includes(updateData.role)) {
      throw new ApiError(400, "Invalid role");
    }
    if (updateData.role === "ward_admin" && (!updateData.assignedWards || !Array.isArray(updateData.assignedWards) || updateData.assignedWards.length === 0)) {
      throw new ApiError(400, "Ward admins must have at least one assigned ward");
    }
  }

  Object.assign(user, updateData);
  await user.save({ validateBeforeSave: true });

  const updatedUser = await User.findById(id).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

// Delete user by ID
const deleteUserController = asyncHandler(async (req, res) => {
  if (req.user.role !== "super_admin") {
    throw new ApiError(403, "Only super admins can delete users");
  }

  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const deletionErrors = [];
  if (user.profilePic) {
    try {
      const publicId = user.profilePic.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`User Profiles/${publicId}`);
    } catch (error) {
      if (!error.message.includes("not found")) {
        deletionErrors.push(`Failed to delete profile picture: ${error.message}`);
      }
    }
  }

  if (user.files.length > 0) {
    try {
      const publicId = user.files[0].url.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`User Files/${publicId}`);
    } catch (error) {
      if (!error.message.includes("not found")) {
        deletionErrors.push(`Failed to delete additional file: ${error.message}`);
      }
    }
  }

  if (deletionErrors.length > 0) {
    throw new ApiError(
      500,
      `Some files could not be deleted: ${deletionErrors.join("; ")}`
    );
  }

  await User.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

// Get current user
const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, { user }, "Current user fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to fetch current user");
  }
});

module.exports = {
  registerUserController,
  generateAccessTokenAndRefreshToken,
  sendOTPVerificationLogin,
  verifyUserOTPLogin,
  sendAdminOTPVerificationLogin,
  verifyAdminUserOTPLogin,
  logoutUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
  getCurrentUser,
};