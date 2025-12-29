// middleware/roles.js

const isCitizen = (req, res, next) => {
  // Checks if the logged-in user has the role "citizen"
  if (req.user && req.user.role === "citizen") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Citizens only." });
  }
};

const isOfficial = (req, res, next) => {
  // Checks if the logged-in user has the role "official"
  if (req.user && req.user.role === "official") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Officials only." });
  }
};

// This exports BOTH functions so other files can find them
module.exports = { isCitizen, isOfficial };