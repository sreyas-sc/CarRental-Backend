import Joi from 'joi';

export const validateVehicle = (data) => {
  const schema = Joi.object({
    make: Joi.string().trim().required().messages({
      'string.empty': 'Make is required.',
      'string.base': 'Make must be a string.',
    }),
    model: Joi.string().trim().required().messages({
      'string.empty': 'Model is required.',
      'string.base': 'Model must be a string.',
    }),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required().messages({
      'number.base': 'Year must be a valid number.',
      'number.integer': 'Year must be a whole number.',
      'number.min': 'Year cannot be earlier than 1900.',
      'number.max': 'Year cannot be more than one year in the future.',
      'any.required': 'Year is required.',
    }),
  });

  return schema.validate(data, { abortEarly: false });
};