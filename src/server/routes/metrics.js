const metricsRouter = require("express").Router();

const { fetchMetrics } = require("../controller/metrics");

metricsRouter.get("/:index", fetchMetrics);

module.exports = { metricsRouter };
