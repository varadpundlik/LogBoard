const asyncHandler = require("express-async-handler");
const indexData = require("../models/indexData");

const addIndexData = asyncHandler(async (req, res) => {
  try {
    const { indexName} = req.body;
    if (!indexName) {
      return res.status(400).json({ message: "All fields are mandatory!" });
    }

    const indexExists = await indexData.findOne({ indexName });
    if (indexExists) {
      return res.status(400).json({ message: "indexData already exist!" });
    }

    const ind = await indexData.create({
      indexName
    });

    return res.status(201).json({ _id: ind.id });
  } catch (error) {
    return res.status(400).json({ message: "indexData data is not valid: " + error.message });
  }
});


module.exports = { addIndexData};
