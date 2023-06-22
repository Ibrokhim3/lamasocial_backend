import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.token;

    if (!token) {
      return res.status(403).json("You are not authorized!");
    }
    const userData = jwt.verify(token, process.env.SECRET_KEY);

    if (userData) {
      return next();
    }
    return res
      .status(403)
      .json("Token doesn't exist or you are not authorized!");
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error (token)" });
  }
};
