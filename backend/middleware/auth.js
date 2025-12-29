const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // 1. Get the token
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    console.log("⛔ No Token Provided");
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // 2. Try to unlock the token with different keys
  try {
    // Attempt 1: Try "secret_token" (Common default)
    const decoded = jwt.verify(token, "secret_token");
    req.user = decoded.user ? decoded.user : decoded;
    console.log("✅ Auth Success (Key: secret_token). User ID:", req.user.id);
    next();
  } catch (err1) {
    try {
      // Attempt 2: Try "secret" (Backup)
      const decoded = jwt.verify(token, "secret");
      req.user = decoded.user ? decoded.user : decoded;
      console.log("✅ Auth Success (Key: secret). User ID:", req.user.id);
      next();
    } catch (err2) {
      // Attempt 3: Try Environment Variable
      try {
          if (process.env.JWT_SECRET) {
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              req.user = decoded.user ? decoded.user : decoded;
              console.log("✅ Auth Success (Key: Env Var). User ID:", req.user.id);
              return next();
          }
          throw new Error("No Env Var");
      } catch (err3) {
          console.error("❌ All Auth Attempts Failed.");
          res.status(401).json({ message: "Token is not valid" });
      }
    }
  }
};