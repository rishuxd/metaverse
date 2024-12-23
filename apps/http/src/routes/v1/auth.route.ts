import express from "express";
import signin from "../../controllers/auth/signin";
import signup from "../../controllers/auth/signup";

const Router = express.Router();

Router.route("/signup").post(signup)
Router.route("/signin").post(signin)

export default Router;