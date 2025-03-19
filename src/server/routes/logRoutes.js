const logsRouter = require("express").Router();

const {
  fetchLogs,
  searchLogs,
  logsSummarization,
  checkAlert,
} = require("../controller/logs");

logsRouter.get("/summarize", logsSummarization);
logsRouter.get("/:index", fetchLogs);
logsRouter.post("/:index/search", searchLogs);
logsRouter.post("/:index/alert", checkAlert);

module.exports = { logsRouter };
