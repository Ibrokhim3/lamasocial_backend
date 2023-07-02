import { Router } from "express";
import { authCtr } from "../controllers/auth_controller.js";
import { verifyToken } from "../../middlewares/auth_middleware.js";
import multer from "multer";
import { v4 } from "uuid";
import { authValidationReg } from "../../validation/auth-validation.js";
import { userValidate } from "../../middlewares/validation_middleware.js";

const router = Router();

//Multer

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, v4() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("invalid image file!", false);
    return res.status(400).json("Invalid file type!");
  }
};

const upload = multer({
  storage,
  fileFilter,
});

//

router.get("/users", authCtr.GET_USERS);
router.get("/user-info", verifyToken, authCtr.GET_USER_INFO);
router.post("/registration", upload.any(), userValidate, authCtr.REGISTER);
router.post("/login", authCtr.LOGIN);
router.put("/update-user", verifyToken, upload.any(), authCtr.UPDATE_USER);
router.put("/online", verifyToken, authCtr.ONLINE);
router.post("/password-reset", authCtr.SEND_EMAIL);
router.put("/:userId/:token", authCtr.SET_NEW_PASS);
// router.get("/get_users/:id", authCtr.GET_USERS);

export default router;
