const userRouter = require("express").Router();

const { register, login, currentUser,listDoctors } = require("../controller/user");

const validateToken=require("../middleware/validateTokenhandler");
userRouter.post("/register",register);
userRouter.post("/login",login);

userRouter.get("/current",validateToken,currentUser);

userRouter.get("/doctors", listDoctors);
module.exports = { userRouter };

