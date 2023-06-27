import { Router } from "express";
import { mainCtr } from "../controllers/main_controller.js";
import multer from "multer";
import { verifyToken } from "../../middlewares/auth_middleware.js";
import { v4 } from "uuid";

import { postValidate } from "../../middlewares/validation_middleware.js";
const router = Router();

//Multer

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, v4() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("invalid image file!", false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

//

router.get("/posts", verifyToken, mainCtr.GET_POSTS);
router.get("/user-posts", verifyToken, mainCtr.GET_USER_POSTS);
router.get("/friends", verifyToken, mainCtr.GET_USER_FRIENDS);
router.post("/likes", verifyToken, mainCtr.POST_LIKES);
router.post(
  "/create-post",
  verifyToken,
  // postValidate,
  upload.single("postImg"),
  mainCtr.ADD_USER_POST
);

export default router;
