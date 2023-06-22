import { Router } from "express";
import { authCtr } from "../controllers/auth_controller.js";
import { verifyToken } from "../../middlewares/auth_middleware.js";
import multer from "multer";
import { v4 } from "uuid";

const router = Router();

//Multer

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, v4() + file.originalname);
  },
});

const upload = multer({ storage: storage });

//

router.get("/users", authCtr.GET_USERS);
router.get("/user_info", verifyToken, authCtr.GET_USER_INFO);
router.post(
  "/registration",
  upload.fields([
    { name: "profileImg", maxCount: 1 },
    { name: "coverImg", maxCount: 1 },
  ]),
  authCtr.REGISTER
);
router.post("/login", authCtr.LOGIN);
router.put("/update_user", authCtr.UPDATE_USER);
// router.get("/get_users/:id", authCtr.GET_USERS);

export default router;
