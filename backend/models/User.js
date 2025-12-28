const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    location: { 
      type: String, 
      required: true // Changed to true because dashboard filters depend on this
    },
    role: { 
      type: String, 
      enum: ["citizen", "official"], 
      default: "citizen" 
    },
    passwordHash: { 
      type: String, 
      required: true 
    },
    // NEW FIELD: Required for Milestone 1 (Verification)
    isVerified: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);