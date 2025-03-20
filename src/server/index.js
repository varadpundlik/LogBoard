require("dotenv").config({path: __dirname+"/config.env"});
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const config = require("./config/config");
const { logsRouter } = require("./routes/logRoutes");
const { metricsRouter } = require("./routes/metrics");
const { rcaRouter } = require("./routes/rca");
const { automationRouter } = require("./routes/automation");
const { userRouter } = require("./routes/user");
const { projectRouter } = require("./routes/project");

const app = express();
const port = 6000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongoose
    .connect(config.db_url)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => res.send("Hello World!"));
app.use("/logs", logsRouter);
app.use("/metrics", metricsRouter);
app.use("/rca", rcaRouter);
app.use("/automation", automationRouter);
app.use("/user", userRouter);
app.use("/project", projectRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
  console.log(config);
});
