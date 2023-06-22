import { authValidationReg } from "../validation/auth-validation.js";

export const userValidate = function (req, res, next) {
  try {
    const { error } = authValidationReg(req.body);
    if (error) {
      console.log(error);
      return res.status(400).json({ msg: error.details[0].message });
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
};
