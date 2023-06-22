import Joi from "joi";

export const authValidationReg = (data) => {
  const schema = Joi.object({
    userName: Joi.string().trim().min(3).max(50).required(),
    userEmail: Joi.string().email().trim().min(5).max(50).required(),
    password: Joi.string()
      .min(4)
      .max(20)
      .trim()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
    password2: Joi.ref("password"),
    profileImg: Joi.allow(""),
    coverImg: Joi.allow(""),
  });
  return schema.validate(data);
};
