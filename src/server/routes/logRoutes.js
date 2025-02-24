const logsRouter = require("express").Router();

const {
  fetchLogs,
  searchLogs,
  logsSummarization,
} = require("../controller/logs");

logsRouter.get("/summarize", logsSummarization);
logsRouter.get("/:index", fetchLogs);
logsRouter.post("/:index/search", searchLogs);

module.exports = { logsRouter };
