import { Router } from "express";
import { mainCtr } from "../controllers/main_controller.js";
import multer from "multer";
import { verifyToken } from "../../middlewares/auth_middleware.js";
import { v4 } from "uuid";

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
    return res.status(400).json("Invalid file type!");
  }
};

const upload = multer({
  storage,
  fileFilter,
});

//

router.get("/posts", verifyToken, mainCtr.GET_POSTS);
router.get("/friends", mainCtr.GET_USER_FRIENDS);
router.post("/likes", verifyToken, mainCtr.POST_LIKES);
router.post(
  "/create_post",
  verifyToken,
  upload.single("postImg"),
  mainCtr.ADD_USER_POST
);

export default router;
