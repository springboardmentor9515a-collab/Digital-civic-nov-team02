const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    location: { type: String, required: true },

    role: {
      type: String,
      enum: ["citizen", "official"],
      default: "citizen",
    },

    passwordHash: { type: String, required: true },

    // Milestone 1 – verification-ready
    isVerified: { type: Boolean, default: false },

    // Optional future-safe fields
    govtIdNumber: { type: String, default: "" },
    verificationDocument: { type: String, default: "" },
  },
  { timestamps: true }
);

// Prevent double hashing
const isBcryptHash = (val) => /^\$2[aby]\$/.test(val || "");

UserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  if (isBcryptHash(this.passwordHash)) return next();

  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

UserSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

module.exports = mongoose.model("User", UserSchema);
