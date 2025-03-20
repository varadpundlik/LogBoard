const projectRouter = require("express").Router();

const { addProject, getProjects,getUserProjects,updateProjectIndices } = require("../controller/project");

// const validateToken=require("../middleware/validateTokenhandler");
projectRouter.post("/update-indices",updateProjectIndices);
projectRouter.post("/addProject",addProject);
projectRouter.get("/getProject", getProjects);
projectRouter.get("/getProject/:email", getUserProjects);
module.exports = { projectRouter };

