import { Router } from "express";
import { authCtr } from "../controllers/auth_controller.js";
import { verifyToken } from "../../middlewares/auth_middleware.js";

const router = Router();

router.get("/users", authCtr.GET_USERS);
router.post("/registration", authCtr.REGISTER);
router.post("/login", authCtr.LOGIN);
// router.get("/get_users/:id", authCtr.GET_USERS);

export default router;
