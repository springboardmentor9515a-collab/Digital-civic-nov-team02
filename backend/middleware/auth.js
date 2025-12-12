const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "secret";

module.exports = function (req, res, next) {
  const header = req.header("Authorization") || "";
  const token = header.replace("Bearer ", "").trim();

  if (!token) {
    return res.status(401).json({ message: "No token. Authorization denied." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // user id
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalid." });
  }
};

