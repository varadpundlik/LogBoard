const express = require("express");
const cors = require("cors");

const { logsRouter } = require("./routes/logRoutes");
const { metricsRouter } = require("./routes/metrics");
const { rcaRouter } = require("./routes/rca");
const { automationRouter } = require("./routes/automation");
const { sendMail } = require("./controller/alert");

const app = express();
const port = 6000;


// // **Call sendMail directly (for testing or automated emails)**
// const mockReq = {
//   body: {
//       email: "parthtagalpallewar123@gmail.com",
//       name: "John Doe",
//       _id: "123456"
//   }
// };

// const mockRes = {
//   status: (code) => ({
//       json: (data) => console.log(`Response [${code}]:`, data)
//   })
// };

app.use(cors());
app.get("/", (req, res) => res.send("Hello World!"));
app.use("/logs", logsRouter);
app.use("/metrics", metricsRouter);
app.use("/rca", rcaRouter);
app.use("/automation", automationRouter);

// Call sendMail after the server starts
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
  
  // **Trigger email sending after server startup**
  // sendMail(mockReq, mockRes);
});