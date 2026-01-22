const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function authMiddleware(req, res, next) {
  try {
    // ✅ 1) Get token from cookies OR Authorization header
    const cookieToken =
      req.cookies?.token || req.cookies?.jwt || req.cookies?.accessToken;

    const authHeader = req.headers.authorization || req.header("Authorization");

    let headerToken = null;
    if (authHeader) {
      headerToken = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;
    }

    const token = cookieToken || headerToken;

    // ✅ 2) If no token
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // ✅ 3) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded could be { id } or { _id }
    const userId = decoded.id || decoded._id;
    if (!userId) {
      return res.status(401).json({ message: "Token payload invalid" });
    }

    // ✅ 4) Fetch full user (IMPORTANT for req.user.location in Milestone-4)
    const user = await User.findById(userId).select("_id name email role location");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ 5) Attach user to request
    req.user = {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};
