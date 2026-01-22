const isCitizen = (req, res, next) => {
  if (req.user && req.user.role === "citizen") return next();
  return res.status(403).json({ message: "Access denied. Citizens only." });
};

const isOfficial = (req, res, next) => {
  if (req.user && req.user.role === "official") return next();
  return res.status(403).json({ message: "Access denied. Officials only." });
};

// ✅ NEW: Generic role guard (Milestone 4 compatible)
const roles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }
    next();
  };
};

// ✅ Export everything (no breaking changes)
module.exports = roles;
module.exports.isCitizen = isCitizen;
module.exports.isOfficial = isOfficial;
