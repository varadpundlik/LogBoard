const automationRouter = require("express").Router();

const { checkLogs } = require("../controller/automation");

automationRouter.get("/", checkLogs);

module.exports = { automationRouter };
