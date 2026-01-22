const mongoose = require("mongoose");

const AdminLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    trim: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Optional: related petition (for responses/status updates)
  petition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Petition",
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AdminLog", AdminLogSchema);
