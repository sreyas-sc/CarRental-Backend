import Joi from 'joi';

export const validateVehicleUpdate = (data) => {
    const schema = Joi.object({
        make: Joi.string().required().messages({
            'string.base': 'Make must be a string',
            'any.required': 'Make is required'
        }),
        model: Joi.string().required().messages({
            'string.base': 'Model must be a string',
            'any.required': 'Model is required'
        }),
        year: Joi.string().required().messages({
            'string.base': 'Year must be a string',
            'any.required': 'Year is required'
        }),
        price: Joi.number().min(0).max(50000).messages({
            'number.base': 'Price must be a number',
            'number.min': 'Price cannot be negative',
            'number.max': 'Price cannot exceed 50,000'
        }),
        quantity: Joi.number().integer().min(1).max(100).messages({
            'number.base': 'Quantity must be a number',
            'number.integer': 'Quantity must be a whole number',
            'number.min': 'Quantity cannot be negative or zero',
            'number.max': 'Quantity cannot exceed 100'
        }),
        availability: Joi.number().integer().min(0).max(100).messages({
            'number.base': 'Availability must be a number',
            'number.integer': 'Availability must be a whole number',
            'number.min': 'Availability cannot be negative',
            'number.max': 'Availability cannot exceed 100'
        }),
        transmission: Joi.string().valid('Manual', 'Automatic', 'Semi-automatic').required().messages({
            'any.only': 'Transmission must be Manual, Automatic, or Semi-automatic',
            'any.required': 'Transmission is required'
        }),
        fuel_type: Joi.string().valid('Petrol', 'Diesel', 'Electric').required().messages({
            'any.only': 'Fuel type must be Petrol, Diesel, or Electric',
            'any.required': 'Fuel type is required'
        }),
        seats: Joi.number().integer().min(1).max(10).required().messages({
            'number.base': 'Seats must be a number',
            'number.integer': 'Seats must be a whole number',
            'number.min': 'Seats must be at least 1',
            'number.max': 'Seats cannot exceed 10',
            'any.required': 'Number of seats is required'
        }),
        description: Joi.string().trim().min(10).max(500).required().messages({
            'string.empty': 'Description cannot be empty',
            'string.min': 'Description must be at least 10 characters long',
            'string.max': 'Description cannot exceed 500 characters',
            'any.required': 'Description is required'
        }),
        primaryImageUrl: Joi.string().optional().uri().messages({
            'string.base': 'Primary image URL must be a string',
            'string.uri': 'Primary image URL must be a valid URL'
        }),
        additionalImageUrls: Joi.array().items(Joi.string().uri()).optional().messages({
            'string.base': 'Each additional image URL must be a string',
            'string.uri': 'Each additional image URL must be a valid URL'
        })
    });

    return schema.validate(data, { abortEarly: false });
};
