const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // Assuming you have a user model
      required: true
    },
    accessible_to: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
      }
    ],
    deployment_ip: {
      type: String,
      required: true
    },
    filebeat_index: {
      type: String,
      required: true
    },
    metricbeat_index: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
