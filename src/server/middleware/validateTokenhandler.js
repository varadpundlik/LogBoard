const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = "medezz123"; // Hardcoded secret

const validateToken = asyncHandler(async (req, res, next) => {
  try {
    let token;
    let authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "User is not authorized or token is missing" });
    }

    token = authHeader.split(" ")[1];

    console.log("Received Token:", token);
    console.log("Using Hardcoded Secret:", ACCESS_TOKEN_SECRET);

    // Verify token
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    
    if (!decoded || !decoded.user) {
      return res.status(401).json({ message: "Invalid token, authorization failed" });
    }

    req.user = decoded.user; // Attach decoded user info to request
    next();
  } catch (error) {
    console.error("Error in token validation:", error.message);
    return res.status(401).json({ message: "User is not authorized, invalid token" });
  }
});

module.exports = validateToken;
