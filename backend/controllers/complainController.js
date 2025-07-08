const asyncHandler = require("../utils/asyncHandler");
const Complaint = require("../models/complainModel");
const { validateUploadedFiles } = require("../utils/fileValidation");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { uploadFileWithFolderLogic, deleteFileFromCloudinary } = require("../helper/cloudinaryHepler");
const mongoose = require("mongoose");

// Create complaint (accessible to all users)
const createComplaintController = asyncHandler(async (req, res) => {
  const { type, ward, description, name, phone, email, location, city, tole, isAnonymous } = req.body;

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

  // Create complaint
  const complaint = await Complaint.create({
    type,
    ward,
    description,
    name: isAnonymous === "true" || isAnonymous === true ? "" : name,
    phone: isAnonymous === "true" || isAnonymous === true ? "" : phone,
    email: isAnonymous === "true" || isAnonymous === true ? "" : email,
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
  });

  const createdComplaint = await Complaint.findById(complaint._id);

  return res
    .status(201)
    .json(new ApiResponse(201, { ...createdComplaint._doc, complaintId }, `Complaint created successfully with ID: ${complaintId}`));
});

// Get all complaints (accessible to all users)
const getAllComplaintsController = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({}).sort({ createdAt: -1 });

  if (!complaints.length) {
    throw new ApiError(404, "No complaints found");
  }

  // Add complaintId to each complaint
  const complaintsWithId = complaints.map(complaint => ({
    ...complaint._doc,
    complaintId: `HS-${complaint._id.toString().slice(-6)}`,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, complaintsWithId, "All complaints fetched successfully"));
});

// Get single complaint by ID (accessible to all users)
const getComplaintController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid complaint ID");
  }

  const complaint = await Complaint.findById(id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { ...complaint._doc, complaintId: `HS-${complaint._id.toString().slice(-6)}` }, "Complaint fetched successfully"));
});

// Update complaint (admin only)
const updateComplaintController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, ward, description, name, phone, email, location, city, tole, isAnonymous, status, priority, assignedDepartment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid complaint ID");
  }

  const complaint = await Complaint.findById(id);
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
    .json(new ApiResponse(200, { ...complaint._doc, complaintId: `HS-${complaint._id.toString().slice(-6)}` }, "Complaint updated successfully"));
});

// Delete complaint (admin only)
const deleteComplaintController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid complaint ID");
  }

  const complaint = await Complaint.findById(id);
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
    throw new ApiError(500, `_some files could not be deleted from Cloudinary: ${deletionErrors.join('; ')}`);
  }

  await Complaint.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Complaint deleted successfully"));
});

// Delete specific file from complaint (admin only)
const deleteComplaintFileController = asyncHandler(async (req, res) => {
  const { id, fileUrl } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid complaint ID");
  }

  const complaint = await Complaint.findById(id);
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
    .json(new ApiResponse(200, { ...complaint._doc, complaintId: `HS-${complaint._id.toString().slice(-6)}` }, "File deleted successfully"));
});

module.exports = {
  createComplaintController,
  getAllComplaintsController,
  getComplaintController,
  updateComplaintController,
  deleteComplaintController,
  deleteComplaintFileController,
};