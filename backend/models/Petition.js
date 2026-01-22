const mongoose = require("mongoose");

const PetitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    location: { type: String, required: true, index: true },

    goal: { type: Number, default: 100 },
    signatureCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["active", "under_review", "closed"],
      default: "active",
      index: true,
    },

    // ✅ Milestone 4 (structured response - keep)
    officialResponse: {
      comment: { type: String, trim: true, default: "" },
      respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      respondedAt: { type: Date },
    },

    // ✅ Milestone 4 (checklist-compatible aliases - non-breaking)
    officialResponseText: { type: String, trim: true, default: "" },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    respondedAt: { type: Date },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Petition", PetitionSchema);
