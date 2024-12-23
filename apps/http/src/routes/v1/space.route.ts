import express from "express";
import createSpace from "../../controllers/space/createSpace";
import getAllSpace from "../../controllers/space/getAllSpace";
import getSpace from "../../controllers/space/getSpace";
import deleteSpace from "../../controllers/space/deleteSpace";
import addAnElement from "../../controllers/space/addAnElement";
import deleteAnElement from "../../controllers/space/deleteAnElement";
import { userMiddleware } from "../../middlewares/user.middleware";

const Router = express.Router();

Router.route("/:spaceId").get(userMiddleware, getSpace);
Router.route("/:spaceId").delete(userMiddleware, deleteSpace);
Router.route("/").post(userMiddleware, createSpace);

Router.route("/element").post(userMiddleware, addAnElement);
Router.route("/element/:id").delete(userMiddleware, deleteAnElement);

Router.route("/all").get(userMiddleware, getAllSpace);

export default Router;
