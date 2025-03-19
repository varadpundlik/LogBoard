const metricsRouter = require("express").Router();

const { fetchMetrics } = require("../controller/metrics");
const { addIndexData } = require("../controller/indexData");

metricsRouter.get("/:index", fetchMetrics);
metricsRouter.post("/addIndex", addIndexData);

module.exports = { metricsRouter };
