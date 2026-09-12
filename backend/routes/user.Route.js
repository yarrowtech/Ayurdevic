import express from "express";
import { register, login, logout, isAuth } from "../controller/user.Controller.js";
import { googleConfig, googleLogin } from "../controller/google.Controller.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/google/config", googleConfig);
userRouter.post("/google", googleLogin);
userRouter.get("/logout", logout);
userRouter.get("/is-auth", isAuth);

export default userRouter;
