const asyncHandler = require("../utils/asyncHandler");
const Complaint = require("../models/complainModel");
const User = require("../models/userModel"); // Import User model
const { validateUploadedFiles } = require("../utils/fileValidation");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { uploadFileWithFolderLogic, deleteFileFromCloudinary } = require("../helper/cloudinaryHepler");
const mongoose = require("mongoose");

// Create complaint (accessible to all users)
const createComplaintController = asyncHandler(async (req, res) => {
  const { type, ward, description, location, city, tole, isAnonymous } = req.body;
  const user = req.user; // Set by verifyJwt middleware, may be undefined

  // Validate required fields
  if (!type || !ward || !description || !city) {
    throw new ApiError(400, "Type, ward, description, and city are required");
  }

  // Validate file uploads if provided
  let files = [];
  if (req.files && req.files.length > 0) {
    validateUploadedFiles(req.files);
    for (const file of req.files) {
      try {
        const result = await uploadFileWithFolderLogic(file.path, file.mimetype, "Complaint Files");
        if (result && result.secure_url) {
          files.push({
            url: result.secure_url,
            type: file.mimetype,
          });
        }
      } catch (error) {
        console.error(`Failed to upload file ${file.path}:`, error.message);
      }
    }
  }

  const complaintId = `HS-${Date.now().toString().slice(-6)}`;

  // Prepare complaint data
  const complaintData = {
    complaintId,
    type,
    ward,
    description,
    location,
    city,
    tole,
    files,
    isAnonymous: isAnonymous === "true" || isAnonymous === true,
    status: "Submitted",
    submittedDate: new Date(),
    lastUpdate: new Date(),
    timeline: [
      {
        date: new Date(),
        status: "Submitted",
        description: "Complaint received and logged into system",
      },
    ],
  };

  // Handle user data based on isAnonymous
  if (isAnonymous === "true" || isAnonymous === true) {
    complaintData.userId = null;
    complaintData.name = "";
    complaintData.phone = "";
    complaintData.email = "";
  } else {
    if (!user) {
      throw new ApiError(401, "Authentication required for non-anonymous complaints");
    }
    complaintData.userId = user._id;
    complaintData.name = user.fullname || "";
    complaintData.phone = user.phoneNumber || "";
    complaintData.email = user.email || "";
  }

  // Create complaint
  const complaint = await Complaint.create(complaintData);

  // Increment complaintsCount in User model for non-anonymous complaints
  if (user && !complaintData.isAnonymous) {
    await User.findByIdAndUpdate(
      user._id,
      { $inc: { complaintsCount: 1 } },
      { new: true }
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, { complaintId }, `Complaint created successfully with ID: ${complaintId}`));
});



// Get all complaints (accessible to all users)
const getAllComplaintsController = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({}).sort({ createdAt: -1 }).lean();
  console.log("Fetched complaints:", complaints); // Debug log
  return res
    .status(200)
    .json(new ApiResponse(200, complaints, "All complaints fetched successfully"));
});

// Get single complaint by complaintId (accessible to all users)
const getComplaintController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const complaint = await Complaint.findOne({ complaintId: id });

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, complaint, "Complaint fetched successfully"));
});

// Update complaint (admin only)
const updateComplaintController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, ward, description, name, phone, email, location, city, tole, isAnonymous, status, priority, assignedDepartment } = req.body;

  const complaint = await Complaint.findOne({ complaintId: id });
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // Update fields if provided
  if (type) complaint.type = type;
  if (ward) complaint.ward = ward;
  if (description) complaint.description = description;
  if (city) complaint.city = city;
  if (tole) complaint.tole = tole;
  if (location) complaint.location = location;
  if (isAnonymous === "true" || isAnonymous === true) {
    complaint.isAnonymous = true;
    complaint.name = "";
    complaint.phone = "";
    complaint.email = "";
  } else {
    if (name) complaint.name = name;
    if (phone) complaint.phone = phone;
    if (email) complaint.email = email;
    complaint.isAnonymous = false;
  }

  // Admin-only fields
  if (status && ["Submitted", "Under Review", "In Progress", "Resolved"].includes(status)) {
    complaint.status = status;
    complaint.timeline.push({
      date: new Date(),
      status,
      description: req.body.timelineDescription || `Status updated to ${status}`,
    });
    complaint.lastUpdate = new Date();
  }
  if (priority && ["Low", "Medium", "High"].includes(priority)) {
    complaint.priority = priority;
    complaint.lastUpdate = new Date();
  }
  if (assignedDepartment) {
    complaint.assignedDepartment = assignedDepartment;
    complaint.lastUpdate = new Date();
  }

  // Validate and upload files if provided
  if (req.files && req.files.length > 0) {
    validateUploadedFiles(req.files);
    const newFiles = [];
    for (const file of req.files) {
      try {
        const result = await uploadFileWithFolderLogic(file.path, file.mimetype, "Complaint Files");
        if (result && result.secure_url) {
          newFiles.push({
            url: result.secure_url,
            type: file.mimetype,
          });
        }
      } catch (error) {
        console.error(`Failed to upload file ${file.path}:`, error.message);
      }
    }
    if (newFiles.length > 0) {
      complaint.files = [...complaint.files, ...newFiles];
      complaint.lastUpdate = new Date();
    }
  }

  await complaint.save();

  return res
    .status(200)
    .json(new ApiResponse(200, complaint, "Complaint updated successfully"));
});

// Delete complaint (admin only)
const deleteComplaintController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const complaint = await Complaint.findOne({ complaintId: id });
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // Delete files from Cloudinary
  const deletionErrors = [];
  for (const file of complaint.files) {
    try {
      await deleteFileFromCloudinary(file.url, file.type);
    } catch (error) {
      console.error(`Failed to delete file ${file.url} from Cloudinary:`, error.message);
      if (!error.message.includes('not found')) {
        deletionErrors.push(`Failed to delete ${file.url}: ${error.message}`);
      }
    }
  }

  if (deletionErrors.length > 0) {
    throw new ApiError(500, `Some files could not be deleted from Cloudinary: ${deletionErrors.join('; ')}`);
  }

  // Decrement complaintsCount in User model
  if (complaint.userId) {
    await User.findByIdAndUpdate(
      complaint.userId,
      { $inc: { complaintsCount: -1 } },
      { new: true }
    );
  }

  await Complaint.deleteOne({ complaintId: id });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Complaint deleted successfully"));
});

// Delete specific file from complaint (admin only)
const deleteComplaintFileController = asyncHandler(async (req, res) => {
  const { id, fileUrl } = req.params;

  const complaint = await Complaint.findOne({ complaintId: id });
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  const fileIndex = complaint.files.findIndex((file) => file.url === fileUrl);
  if (fileIndex === -1) {
    throw new ApiError(404, "File not found in complaint");
  }

  try {
    await deleteFileFromCloudinary(complaint.files[fileIndex].url, complaint.files[fileIndex].type);
  } catch (error) {
    console.error(`Failed to delete file ${fileUrl} from Cloudinary:`, error.message);
    if (!error.message.includes('not found')) {
      throw new ApiError(500, `Failed to delete file ${fileUrl}: ${error.message}`);
    }
  }

  // Remove file from complaint
  complaint.files.splice(fileIndex, 1);
  complaint.lastUpdate = new Date();
  await complaint.save();

  return res
    .status(200)
    .json(new ApiResponse(200, complaint, "File deleted successfully"));
});

const upvoteComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const complaint = await Complaint.findOne({ complaintId: id });
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }
  complaint.upvotes = (complaint.upvotes || 0) + 1;
  await complaint.save();
  return res
    .status(200)
    .json(new ApiResponse(200, complaint, "Upvote added successfully"));
});

module.exports = {
  createComplaintController,
  getAllComplaintsController,
  getComplaintController,
  updateComplaintController,
  deleteComplaintController,
  deleteComplaintFileController,
  upvoteComplaint,
};