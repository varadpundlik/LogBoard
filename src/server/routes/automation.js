const automationRouter = require("express").Router();

const { checkLogs } = require("../controller/automation");

automationRouter.get("/:index", checkLogs);

module.exports = { automationRouter };
