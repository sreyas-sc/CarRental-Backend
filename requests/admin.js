// src/requests/admin.js

import Joi from 'joi';

// Define validation schema for login
export const validateAdminLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address.',
      'string.empty': 'Email cannot be empty.',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long.',
      'string.empty': 'Password cannot be empty.',
    }),
  });

  // Validate data and return result
  return schema.validate(data);
};


export const validateRentableVehicle = (input) => {
  const schema = Joi.object({
    make: Joi.string().required().messages({
      'string.empty': 'Make is required.',
    }),
    model: Joi.string().required().messages({
      'string.empty': 'Model is required.',
    }),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required().messages({
      'number.base': 'Year must be a valid number.',
      'number.min': 'Year cannot be earlier than 1900.',
      'number.max': 'Year cannot be in the future.',
      'any.required': 'Year is required.',
    }),
    price: Joi.number().positive().required().messages({
      'number.base': 'Price must be a valid number.',
      'number.positive': 'Price must be a positive number.',
      'any.required': 'Price is required.',
    }),
    quantity: Joi.number().integer().positive().required().messages({
      'number.base': 'Quantity must be a valid number.',
      'number.positive': 'Quantity must be greater than zero.',
      'any.required': 'Quantity is required.',
    }),
    availability: Joi.number().required().messages({
      'any.required': 'Availability is required.',
    }),
    // availability: Joi.boolean().required(),
    transmission: Joi.string().valid('Manual', 'Automatic', 'Semi-Automatic').required().messages({
      'any.only': 'Transmission must be Manual, Automatic, or Semi-Automatic.',
      'string.empty': 'Transmission is required.',
    }),
    fuel_type: Joi.string().valid('Petrol', 'Diesel', 'Electric').required().messages({
      'any.only': 'Fuel type must be Petrol, Diesel, or Electric.',
      'string.empty': 'Fuel type is required.',
    }),
    seats: Joi.number().integer().min(1).max(10).required().messages({
      'number.min': 'Seats must be at least 1.',
      'number.max': 'Seats cannot exceed 10.',
    }),
    description: Joi.string().max(500).required().messages({
      'string.max': 'Description cannot exceed 500 characters.',
      'any.required': 'Description is required.',
    }),
  });

  
  return schema.validate(input);
};
