const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    city: {
      type: String,
      enum: ["Kathmandu", "Lalitpur", "Bhaktapur"],
      required: true,
    },
    wardNumber: {
      type: String,
      required: true,
      trim: true,
    },
    tole: {
      type: String,
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "super_admin", "ward_admin"],
      default: "user",
    },
    assignedWards: {
      type: [String],
      default: [],
      validate: {
        validator: function (value) {
          return this.role !== "ward_admin" || value.length > 0;
        },
        message: "Ward admins must have at least one assigned ward",
      },
    },
    refreshToken: {
      type: String,
    },
    profilePic: {
      type: String,
      required: true,
    },
    files: {
      type: [
        {
          url: { type: String, required: true },
          type: { type: String, required: true },
        },
      ],
      validate: {
        validator: function (value) {
          return value.length <= 1;
        },
        message: "You can only upload up to 1 additional file",
      },
      default: [],
    },
    complaintsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.pre("save", function (next) {
  if (!this.username && this.fullname) {
    this.username = this.fullname.toLowerCase().replace(/\s+/g, "_");
  }
  const wardNum = parseInt(this.wardNumber);
  if (this.city === "Kathmandu" && (wardNum < 1 || wardNum > 32)) {
    return next(new Error("Ward number for Kathmandu must be between 1 and 32"));
  }
  if (this.city === "Lalitpur" && (wardNum < 1 || wardNum > 29)) {
    return next(new Error("Ward number for Lalitpur must be between 1 and 29"));
  }
  if (this.city === "Bhaktapur" && (wardNum < 1 || wardNum > 10)) {
    return next(new Error("Ward number for Bhaktapur must be between 1 and 10"));
  }
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

const User = mongoose.model("User", userSchema);
module.exports = User;