import Joi from "joi";

export const postValidation = (data) => {
  const schema = Joi.object({
    postText: Joi.string().min(3).max(100).required(),
    postImg: Joi.binary().required(),
  });
  return schema.validate(data);
};
