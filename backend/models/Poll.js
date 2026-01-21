const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    options: [
      {
        text: { type: String, required: true },
        votes: { type: Number, default: 0 } 
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetLocation: {
      type: String,
      required: true,
    },
    // We removed 'voters' array to use the safe 'Vote' model instead
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Poll", pollSchema);