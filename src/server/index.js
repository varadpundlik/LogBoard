const express = require("express");

const { logsRouter } = require("./routes/logRoutes");
const { metricsRouter } = require("./routes/metrics");
const { rcaRouter } = require("./routes/rca");
const { automationRouter } = require("./routes/automation");

const app = express();
const port = 6000;

app.get("/", (req, res) => res.send("Hello World!"));
app.use("/logs", logsRouter);
app.use("/metrics", metricsRouter);
app.use("/rca", rcaRouter);
app.use("/automation", automationRouter);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
