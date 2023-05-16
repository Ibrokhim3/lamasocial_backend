import { Router } from "express";
import { mainCtr } from "../controllers/main_controller.js";
import { verifyToken } from "../../middlewares/auth_middleware.js";

const router = Router();
router.get("/posts", verifyToken, mainCtr.GET_POSTS);
router.get("/friends", mainCtr.GET_USER_FRIENDS);
router.post("/likes", verifyToken, mainCtr.POST_LIKES);
router.post("/create_post", mainCtr.ADD_USER_POST);

export default router;
