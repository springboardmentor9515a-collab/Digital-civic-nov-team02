const mongoose = require("mongoose");

const PetitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },

    goal: { type: Number, default: 100 },
    signatureCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["active", "under_review", "closed"],
      default: "active",
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 👇 MILESTONE 4 ADDITIONS (Required for Official Responses) 👇
    officialResponse: {
      type: String,
      default: null, // Stores the text of the official's reply
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Links to the Official who replied
    },
    respondedAt: {
      type: Date,
      default: null, // Timestamp of the response
    },
    // 👆 END MILESTONE 4 ADDITIONS 👆
  },
  { timestamps: true }
);

module.exports = mongoose.model("Petition", PetitionSchema);