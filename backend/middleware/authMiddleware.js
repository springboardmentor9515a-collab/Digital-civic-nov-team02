const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Get token from header
  const token = req.header('Authorization');

  // 2. Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // 3. Verify token
  try {
    // Remove "Bearer " if it's sent in the header (optional, depends on frontend)
    const cleanToken = token.replace('Bearer ', '');
    
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    req.user = decoded; // Adds user data (id, role) to the request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};