const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  indexName: {
    type: String,
    required: true,
    unique: true,
  },
});


const indexData = mongoose.model("indexData", userSchema);

module.exports = indexData;
