import jwt from "jsonwebtoken";
import { pool } from "../src/config/db_config.js";

export const verifyToken = async (req, res, next) => {
  const token = req.headers.token;

  if (!token) {
    return res.status(400).send("You have to log in to the system!");
  }
  const userData = jwt.verify(token, process.env.SECRET_KEY);

  if (userData) {
    return next();
  }
  res.send("Token doesn't exist or you are not authorized!");
};
