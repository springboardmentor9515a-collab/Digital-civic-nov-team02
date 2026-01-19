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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Petition", PetitionSchema);
