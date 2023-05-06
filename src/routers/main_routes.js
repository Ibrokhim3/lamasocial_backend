import { Router } from "express";
import {mainCtr} from "../controllers/main_controller.js";
import { verifyToken } from "../../middlewares/auth_middleware.js";

const router = Router();

router.post("/likes", mainCtr.POST_LIKES);
// router.post("/login", mainCtr.LOGIN);
// router.get("/get_users/:id", authCtr.GET_USERS);

export default router;
