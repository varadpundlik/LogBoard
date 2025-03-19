const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { logsRouter } = require("./routes/logRoutes");
const { metricsRouter } = require("./routes/metrics");
const { rcaRouter } = require("./routes/rca");
const { automationRouter } = require("./routes/automation");
const { userRouter } = require("./routes/user");

const app = express();
const port = 6000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongoose
    .connect("mongodb+srv://Varad:Varad@cluster0.36hlagn.mongodb.net/logboardDB")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

app.use(cors());
app.get("/", (req, res) => res.send("Hello World!"));
app.use("/logs", logsRouter);
app.use("/metrics", metricsRouter);
app.use("/rca", rcaRouter);
app.use("/automation", automationRouter);
app.use("/user", userRouter);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
