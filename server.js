import cors from "cors";
import dotenv from "dotenv";
import express from "express";
// import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./src/routers/auth_router.js";
import mainRouter from "./src/routers/main_routes.js";
const app = express();

export const __filename = fileURLToPath(import.meta.url);

export const __dirname = path.dirname(__filename);

dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(fileUpload());
app.use(express.static(path.join(process.cwd(), "./assets")));
app.use("/lamasocial", authRouter);
app.use("/lamasocial", mainRouter);
const PORT = process.env.PORT || 1201;

app.listen(PORT, () => {
  console.log(`${PORT} is running`);
});
