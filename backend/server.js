// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Import Routes
const authRoutes = require("./routes/auth");
const petitionRoutes = require("./routes/petitions");
const issueRoutes = require("./routes/issues");
const pollRoutes = require("./routes/polls");

// ✅ MILESTONE 4 ROUTES
const governanceRoutes = require("./routes/governance");
const reportRoutes = require("./routes/reports");

dotenv.config();

const app = express();

// Middleware (ORDER MATTERS)
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/petitions", petitionRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/polls", pollRoutes);

// ✅ Milestone 4
app.use("/api/governance", governanceRoutes);
app.use("/api/reports", reportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
