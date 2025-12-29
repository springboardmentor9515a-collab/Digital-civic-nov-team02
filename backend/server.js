// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Import Routes
const authRoutes = require("./routes/auth");
const petitionRoutes = require("./routes/petitions");
const issueRoutes = require("./routes/issues"); // <--- IMPORTED HERE

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/petitions", petitionRoutes);
app.use("/api/issues", issueRoutes); // <--- CONNECTED HERE

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));