const mongoose = require("mongoose");

const PetitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  
  // FIX: Removed 'enum' so it accepts "Infrastructure" (Capital I) without crashing
  category: { 
    type: String, 
    required: true 
  },
  
  location: { type: String, required: true },
  
  // FIX: Added these fields so the backend doesn't crash on "goal"
  goal: { type: Number, default: 100 }, 
  signatureCount: { type: Number, default: 0 },
  signers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  status: {
    type: String,
    enum: ["active", "under_review", "closed"], // These are internal, so enums are okay here
    default: "active",
  },
  
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true // TEMPORARY: Comment this out if Auth is tricky, but try leaving it first
  },
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Petition", PetitionSchema);