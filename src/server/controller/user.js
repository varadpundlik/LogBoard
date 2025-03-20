const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");

// Hardcoded secret for JWT
const ACCESS_TOKEN_SECRET = "LogBoard";

// Register new user
const register = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are mandatory!" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already registered!" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({ _id: user.id, email: user.email });
  } catch (error) {
    console,log(error);
    return res.status(400).json({ message: "User data is not valid: " + error.message });
  }
});

// Login user and generate token
const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are mandatory!" });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = jwt.sign(
        {
          user: {
            username: user.username,
            email: user.email,
            id: user.id,
          },
        },
        ACCESS_TOKEN_SECRET, // Hardcoded secret
        { expiresIn: "30d" }
      );

      return res.status(200).json({ accessToken });
    } else {
      return res.status(401).json({ message: "Email or password is not valid" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error: " + error.message });
  }
});

// Get authenticated user details
const currentUser = asyncHandler(async (req, res) => {
  try {
    console.log("Authenticated User Data:", req.user);

    if (!req.user) {
      return res.status(401).json({ message: "User not found or unauthorized" });
    }

    return res.status(200).json(req.user);
  } catch (error) {
    console.error("Error fetching current user:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({}, "id username email");
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = { register, login, currentUser, getUsers };
