import express from 'express';
import authRoutes from './v1/auth.route'
import userRoutes from './v1/user.route'
import spaceRoutes from './v1/space.route'
import adminRoutes from './v1/admin.route'
import getAvailableAvatars from '../controllers/avatar/getAvailableAvatars';
import getAvailableElements from '../controllers/element/getAvailableElements';

const Router = express.Router();

Router.route("/avatars").get(getAvailableAvatars);
Router.route("/elements").get(getAvailableElements);

Router.use("/auth", authRoutes );
Router.use("/user", userRoutes );
Router.use("/space", spaceRoutes );
Router.use("/admin", adminRoutes );



export default Router;

