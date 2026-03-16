const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Get token from "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adds user info to the request
    next();
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
};