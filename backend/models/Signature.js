const mongoose = require("mongoose");

const SignatureSchema = new mongoose.Schema({
  petition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Petition",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

// CHECKLIST: Compound Unique Index
// Ensures one user cannot sign the same petition twice
SignatureSchema.index({ petition: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Signature", SignatureSchema);