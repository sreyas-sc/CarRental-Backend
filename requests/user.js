// src/requests/user.js
import Joi from 'joi';

// Validation for user registration
export const validateRegister = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required().messages({
      'string.min': 'Name should have at least 3 characters.',
      'string.empty': 'Name is required.',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address.',
      'string.empty': 'Email is required.',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long.',
      'string.empty': 'Password is required.',
    }),
    phone: Joi.string().required().messages({
      'string.empty': 'Phone number is required.',
    }),
    city: Joi.string().required().messages({
      'string.empty': 'City is required.',
    }),
    country: Joi.string().required().messages({
      'string.empty': 'Country is required.',
    }),
    state: Joi.string().required().messages({
      'string.empty': 'State is required.',
    }),
  });

  return schema.validate(data);
};

// Validation for user login
export const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address.',
      'string.empty': 'Email is required.',
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required.',
    }),
  });

  return schema.validate(data);
};

// Validation for updating user profile
export const validateUpdateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    city: Joi.string().optional(),
    country: Joi.string().optional(),
    state: Joi.string().optional(),
  });

  return schema.validate(data);
};

// Validation for changing password
export const validateChangePassword = (data) => {
  const schema = Joi.object({
    currentPassword: Joi.string().required().messages({
      'string.empty': 'Current password is required.',
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.min': 'New password must be at least 6 characters long.',
      'string.empty': 'New password is required.',
    }),
  });

  return schema.validate(data);
};
