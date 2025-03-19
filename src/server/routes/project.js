const projectRouter = require("express").Router();

const { addProject, getProjects,getUserProjects } = require("../controller/project");

// const validateToken=require("../middleware/validateTokenhandler");
projectRouter.post("/addProject",addProject);
projectRouter.get("/getProject", getProjects);
projectRouter.get("/getProject/:email", getUserProjects);
module.exports = { projectRouter };

