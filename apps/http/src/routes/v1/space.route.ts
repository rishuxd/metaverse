import express from "express";
import createSpace from "../../controllers/space/createSpace";
import getAllSpace from "../../controllers/space/getAllSpace";
import getSpace from "../../controllers/space/getSpace";
import deleteSpace from "../../controllers/space/deleteSpace";
import { userMiddleware } from "../../middlewares/user.middleware";

const Router = express.Router();

Router.route("/").post(userMiddleware, createSpace);
Router.route("/all").get(userMiddleware, getAllSpace);
Router.route("/:spaceId").get(userMiddleware, getSpace);
Router.route("/:spaceId").delete(userMiddleware, deleteSpace);

export default Router;
