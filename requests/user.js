// src/requests/user.js
import Joi from 'joi';


const patterns = {
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  phone: /^\+[1-9]\d{1,14}$/, // International phone number format
  name: /^[a-zA-Z\s'-]+$/, // Letters, spaces, hyphens, and apostrophes
};

// Common messages
const messages = {
  name: {
    'string.pattern.base': 'Name can only contain letters, spaces, hyphens, and apostrophes',
    'string.min': 'Name must be at least {#limit} characters long',
    'string.max': 'Name cannot exceed {#limit} characters',
    'string.empty': 'Name is required',
  },
  email: {
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email is required',
  },
  password: {
    // 'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    // 'string.min': 'Password must be at least {#limit} characters long',
    // 'string.max': 'Password cannot exceed {#limit} characters',
    'string.empty': 'Password is required',
  },
  phone: {
    'string.pattern.base': 'Phone number must be in international format (e.g., +918111904512)',
    'string.empty': 'Phone number is required',
  },
  location: {
    'string.pattern.base': 'Only letters, numbers, spaces, and basic punctuation are allowed',
    'string.min': 'Must be at least {#limit} characters long',
    'string.max': 'Cannot exceed {#limit} characters',
    'string.empty': 'This field is required',
  },
};

// Validation for user registration
export const validateRegister = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .pattern(patterns.name)
      .min(3)
      .max(50)
      .required()
      .trim()
      .messages(messages.name),

    email: Joi.string()
      .email({ tlds: { allow: false } })
      .max(100)
      .required()
      .lowercase()
      .trim()
      .messages(messages.email),

    password: Joi.string()
      // .pattern(patterns.password)
      .min(6)
      .max(100)
      .required()
      .messages(messages.password),

    phone: Joi.string()
      // .pattern(patterns.phone)
      .required()
      .messages(messages.phone),

    city: Joi.string()
      .pattern(/^[a-zA-Z\s\-,.]+$/)
      .min(2)
      .max(50)
      .required()
      .trim()
      .messages(messages.location),

    state: Joi.string()
      .pattern(/^[a-zA-Z\s\-,.]+$/)
      .min(2)
      .max(50)
      .required()
      .trim()
      .messages(messages.location),

    country: Joi.string()
      .pattern(/^[a-zA-Z\s\-,.]+$/)
      .min(2)
      .max(50)
      .required()
      .trim()
      .messages(messages.location),
  });

  return schema.validate(data, { abortEarly: false });
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
