import express from "express";
import createMap from "../../controllers/admin/createMap";
import createAvatar from "../../controllers/admin/createAvatar";
import updateElement from "../../controllers/admin/updateElement";
import createElement from "../../controllers/admin/createElement";
import { adminMiddleware } from "../../middlewares/admin.middleware";

const Router = express.Router();

Router.route("/element").post(adminMiddleware, createElement);
Router.route("/element/:id").put(adminMiddleware, updateElement);
Router.route("/avatar").post(adminMiddleware, createAvatar);
Router.route("/map").post(adminMiddleware, createMap);

export default Router;
