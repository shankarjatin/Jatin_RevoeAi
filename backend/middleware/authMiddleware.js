const jwt = require('jwt-simple');
const User = require('../models/userModel');

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    req.user = decoded; // Attach the decoded token (user info) to the request
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
