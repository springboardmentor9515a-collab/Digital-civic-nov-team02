const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  let token = null;

  // 1️⃣ Check cookie first (preferred)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 2️⃣ Fallback to Authorization header
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.replace("Bearer ", "");
  }

  if (!token) {
    console.log("⛔ No Token Provided");
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("✅ Auth Success. User ID:", decoded.id);
    next();
  } catch (err) {
    console.error("❌ Invalid or Expired Token");
    return res.status(401).json({ message: "Token is not valid" });
  }
};
