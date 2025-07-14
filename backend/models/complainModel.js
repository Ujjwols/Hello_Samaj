const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    ward: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      enum: ["Kathmandu", "Lalitpur", "Bhaktapur"],
      required: true,
    },
    tole: {
      type: String,
      trim: true,
      default: "",
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
          return value.length <= 10; // Max 10 files
        },
        message: "You can only upload up to 10 files",
      },
      default: [],
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Submitted", "Under Review", "In Progress", "Resolved"],
      default: "Submitted",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    assignedDepartment: {
      type: String,
      trim: true,
      default: "",
    },
    submittedDate: {
      type: Date,
      default: Date.now,
    },
    lastUpdate: {
      type: Date,
      default: Date.now,
    },
    upvotes: { type: Number, default: 0 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Allow null for anonymous complaints
    },
    timeline: {
      type: [
        {
          date: { type: Date, default: Date.now },
          status: { type: String, enum: ["Submitted", "Under Review", "In Progress", "Resolved"] },
          description: { type: String, required: true },
        },
      ],
      default: [
        {
          date: Date.now(),
          status: "Submitted",
          description: "Complaint received and logged into system",
        },
      ],
    },
  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;