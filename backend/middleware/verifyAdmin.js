const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const verifyAdmin = asyncHandler(async (req, res, next) => {
  if (!["super_admin", "ward_admin"].includes(req.user.role)) {
    throw new ApiError(403, "Admins only");
  }
  next();
});

module.exports = verifyAdmin;