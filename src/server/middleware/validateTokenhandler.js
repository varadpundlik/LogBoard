const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = "LogBoard"; // Make sure this is the correct secret

const validateToken = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
      req.user = decoded.user; // Attach user details to request
      return next(); // User is authorized, move to next middleware/controller
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  }

  return res.status(401).json({ message: "Authorization token required" });
};

module.exports = validateToken;
