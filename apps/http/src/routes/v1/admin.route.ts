import express from "express";
import createMap from "../../controllers/admin/createMap";
import createAvatar from "../../controllers/admin/createAvatar";
import { adminMiddleware } from "../../middlewares/admin.middleware";
import { uploadSingleImage } from "../../middlewares/uploadMiddleware";
import updateMap from "../../controllers/admin/updateMap";

const Router = express.Router();

Router.route("/avatar").post(adminMiddleware, uploadSingleImage, createAvatar);
Router.route("/map").post(adminMiddleware, uploadSingleImage, createMap);
Router.route("/map/:id").patch(adminMiddleware, uploadSingleImage, updateMap);

export default Router;
