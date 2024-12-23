import express from "express";
import updateUserMetadata from "../../controllers/user/updateUserMetadata";
import getOtherUserMetadata from "../../controllers/user/getOtherUserMetadata";
import { userMiddleware } from "../../middlewares/user.middleware";

const Router = express.Router();

Router.route("/metadata").post(userMiddleware, updateUserMetadata);
Router.route("/metadata/bulk/:ids").get(getOtherUserMetadata);

export default Router;
