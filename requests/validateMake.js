import Joi from 'joi';

export const validateMake = (data) => {
  const schema = Joi.object({
    make: Joi.string().trim().required().messages({
      'string.empty': 'Make is required.',
      'string.base': 'Make must be a string.',
    }),
  });

  return schema.validate(data, { abortEarly: false });
}