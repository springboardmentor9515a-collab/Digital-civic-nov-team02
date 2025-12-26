const mongoose = require("mongoose");

const PetitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    location: { type: String },
    goal: { type: Number, default: 100 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["active", "under_review", "resolved"], default: "active" },
    signatures: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Petition", PetitionSchema);
