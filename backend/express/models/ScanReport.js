const mongoose = require("mongoose");

const ScanReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    url: { type: String, required: true },
    scanType: { type: String, default: "full" },
    scanId: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["queued", "pending", "running", "completed", "failed"],
      default: "pending",
    },
    submittedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },

    // Raw responses from the scanner service (kept flexible)
    submitResponse: { type: mongoose.Schema.Types.Mixed },
    statusResponse: { type: mongoose.Schema.Types.Mixed },
    resultResponse: { type: mongoose.Schema.Types.Mixed },

    errorMessage: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScanReport", ScanReportSchema);
