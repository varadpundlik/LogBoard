const rcaRouter = require("express").Router();

const { fetchRCA } = require("../controller/rca");

rcaRouter.get("/", fetchRCA);

module.exports = { rcaRouter };
