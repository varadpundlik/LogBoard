const asyncHandler = require("express-async-handler");
const Project = require("../models/project");
const User = require("../models/user"); // Import User model

// Add a new project using owner_email instead of owner ID
const addProject = asyncHandler(async (req, res) => {
  const { name, description, owner_email, accessible_to_emails, deployment_ip, filebeat_index, metricbeat_index } = req.body;

  if (!name || !description || !owner_email || !deployment_ip || !filebeat_index || !metricbeat_index) {
    return res.status(400).json({ message: "All required fields must be provided!" });
  }

  // Find owner by email
  const det=await User.findOne({});
  console.log("----------");
  console.log(det);
  const owner = await User.findOne({ email: owner_email });
  if (!owner) {
    return res.status(400).json({ message: "Owner not found!" });
  }

  // Find accessible_to users by emails
  let accessible_to = [];
  if (accessible_to_emails && accessible_to_emails.length > 0) {
    const users = await User.find({ email: { $in: accessible_to_emails } }, "_id");
    accessible_to = users.map(user => user._id);
  }

  const project = await Project.create({
    name,
    description,
    owner: owner._id,
    accessible_to,
    deployment_ip,
    filebeat_index,
    metricbeat_index
  });

  res.status(201).json({ message: "Project created successfully", project });
});

// Get all projects with user email populated
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find()
    .populate("owner", "name email") // Populate owner with name and email
    .populate("accessible_to", "name email"); // Populate accessible users with name and email

  res.status(200).json(projects);
});
// Get projects where the user is either owner or in accessible_to
const getUserProjects = asyncHandler(async (req, res) => {
    const { email } = req.params;
  
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
  
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    // Find projects where the user is either owner or in accessible_to
    const projects = await Project.find({
      $or: [
        { owner: user._id },
        { accessible_to: user._id }
      ]
    }).populate("owner", "name email")
      .populate("accessible_to", "name email");
  
    res.status(200).json(projects);
  })
module.exports = { addProject, getProjects,getUserProjects };
