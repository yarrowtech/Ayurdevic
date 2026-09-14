import express from "express";
import { register, login, logout, isAuth } from "../controller/user.Controller.js";
import { googleConfig, googleLogin } from "../controller/google.Controller.js";
import addressRouter from "./address.Route.js";
import orderRouter from "./order.Route.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/google/config", googleConfig);
userRouter.post("/google", googleLogin);
userRouter.get("/logout", logout);
userRouter.get("/is-auth", isAuth);
userRouter.use("/addresses", addressRouter);
userRouter.use("/orders", orderRouter);

export default userRouter;
