const rcaRouter = require("express").Router();

const { fetchRCA } = require("../controller/rca");

rcaRouter.get("/:index", fetchRCA);

module.exports = { rcaRouter };
