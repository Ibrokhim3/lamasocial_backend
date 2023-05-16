import Joi from "joi";

export const authValidationReg = (data) => {
  const schema = Joi.object({
    user_name: Joi.string().trim().min(3).max(50).required(),
    user_email: Joi.string().email().trim().min(5).max(50).required(),
    password: Joi.string()
      .trim()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
  });
  return schema.validate(data);
};
