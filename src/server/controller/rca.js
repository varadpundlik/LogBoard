const { ask } = require("../utils/llm");

const fetchRCA = async (req, res) => {
  try {
    const index = req.params.index;
    const response = await ask(`root_cause`,index);
    res.json(response);
  } catch (error) {
    console.error("Error fetching RCA:", error);
    res.status(500).json({ error: "An error occurred while fetching RCA." });
  }
};

module.exports = {
  fetchRCA,
};
