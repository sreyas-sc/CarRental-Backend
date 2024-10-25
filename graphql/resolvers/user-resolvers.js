// These files contain the logic for handling GraphQL queries and mutations. Resolvers fetch data based on the defined schema.
// user-resolvers.js: Handles user-specific operations like user registration, login, and profile management.

import bcrypt from 'bcrypt'; // Import bcrypt for hashing passwords
import User from '../../models/user-model.js';
import { createToken } from '../../utils/createToken.js'; 
import minioClient from '../../config/minioClient.js';
import { GraphQLUpload } from 'graphql-upload';
import { validateRegister, validateLogin, validateUpdateUser, validateChangePassword } from '../../requests/user.js';
import { ApolloError } from 'apollo-server-express'; // Import ApolloError
import dotenv from 'dotenv';
import crypto from 'crypto';
import twilio from  'twilio'

// for configuration of the environment variables
dotenv.config();

// Twilio initialization
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// In-memory storage for OTPs
const otpStorage = new Map();

const userResolvers = {

    // ******************Queries****************************
    
    Query: {

        // Query to get all the users
        getAllUsers: async () => {
            return await User.findAll();
        },
    },

    // **********************Mutations***********************

    Mutation: {


        // Mutation to send OTP on User registration using Twilio
        sendOTP: async () => {
            try {
              const serviceSid = process.env.TWILIO_SERVICE_SID;
              if (!serviceSid) {
                throw new Error("Twilio Service SID is not defined.");
              }
          
              // Static phone number in international format
              const phone = '+918111904512';  // Replace with the user's phone number(twilio free plan only allows one number hence the static number)
  
              // Send the OTP via Twilio
              await client.verify.v2.services(serviceSid)
                .verifications
                .create({ to: phone, channel: 'sms' });
          
              return { success: true, message: 'OTP sent successfully' };
            } catch (error) {
              console.error('Error sending OTP:', error.message);
              return { success: false, message: 'Failed to send OTP' };
            }
        },
        // __________________________________________________________________________       

        // Mutation for OTP Verification with Twilio
        verifyOTP: async (_, { otp }) => {
        try {
            const phone = '+918111904512';  // Static phone number
            const serviceSid = process.env.TWILIO_SERVICE_SID;
        
            // Verify the OTP via Twilio
            const verification = await client.verify.v2.services(serviceSid)
            .verificationChecks
            .create({ to: phone, code: otp });
        
            if (verification.status === 'approved') {
            return { success: true, message: 'OTP verified successfully' };
            } else {
            return { success: false, message: 'Invalid OTP' };
            }
        } catch (error) {
            console.error('Error verifying OTP:', error.message);
            return { success: false, message: 'Failed to verify OTP' };
        }
        },
        // __________________________________________________________________________       
        
        // Mutation for User Registration Mutation
        register: async (_, { name, email, phone, city, state, country, password }) => {
        try {
            console.log("The user creation mutation is HIT!!!!")

            const { error } = validateRegister({ name, email, password, phone, city, country, state });
            if (error) {
                throw new Error(error.details[0].message);
            }
            // console.log(name, email, phone, city, state, country, password);
            // Check if user already exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
            throw new Error('User already exists with this email'); // Use Error here
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = await User.create({ 
            name, 
            email, 
            phone, 
            city, 
            state, 
            country, 
            password: hashedPassword 
            });
            
            // Generate token 
            const token = createToken(user.id);
            // Return an object with necessary fields
            return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                city: user.city,
                state: user.state,
                country: user.country,
            },
            };
        } catch (error) {
            console.error('Error registering user:', error);
            throw new Error('Failed to register user'); // Use Error instead of a string
        }
        },
        // __________________________________________________________________________
          
        // Mutation for admin registration(used to add admin via thunderclient)
        registerAdmin: async (_, { email, password }) => {
            const hashedPassword = await bcrypt.hash(password, 10);
            return await Admin.create({ email, password: hashedPassword });
        },
    
        // __________________________________________________________________________

        // Mutation for user login
        login: async (_, { email, password }) => {
            try {
                // Validate Login Input
                const { error } = validateLogin({ email, password });
                if (error) {
                    throw new ApolloError('Validation failed', '422', {
                        validationError: error.details[0].message,
                        status: 422
                    });
                }
        
                // Find user by email
                const user = await User.findOne({ where: { email } });
                if (!user) {
                    throw new ApolloError('User not found', '404', {
                        userNotFound: 'No user found with this email',
                        status: 404
                    });
                }
        
                // Compare password
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    throw new ApolloError('Password does not match', '422', {
                        passwordMismatch: 'Incorrect password',
                        status: 422
                    });
                }
        
                // Generate token
                const token = createToken(user.id);
        
                // Return success response
                return {
                    token,
                    user,
                    status: 200,
                    message: 'Login successful'
                };
        
            } catch (error) {
                if (error.extensions?.code === '422') {
                    throw new ApolloError(error.message, '422', {
                        ...error.extensions,
                        status: 422
                    });
                } else if (error.extensions?.code === '404') {
                    throw new ApolloError(error.message, '404', {
                        ...error.extensions,
                        status: 404
                    });
                } else {
                    throw new ApolloError('Internal server error', '500', {
                        internalServerError: 'Something went wrong during login',
                        status: 500
                    });
                }
            }
        },
        // __________________________________________________________________________
        
        // Mutation to update user profile detsils
        updateUser: async (_, { id, input }) => {

            // Validate update user input
            const { error } = validateUpdateUser(input);
            if (error) {
                throw new Error(error.details[0].message);
            }

            const user = await User.findByPk(id);
            if (!user) {
                throw new Error('User not found');
            }

            await user.update(input);
            return user;
        },
        // __________________________________________________________________________

        // Mutation to update user password
        changePassword: async (_, { userId, currentPassword, newPassword }) => {

            const { error } = validateChangePassword({ currentPassword, newPassword });
            if (error) {
                throw new Error(error.details[0].message);
            }
           
            
            const user = await User.findByPk(userId);

            if (!user) {
                throw new Error('User not found');
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                throw new Error('Current password is incorrect');
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedNewPassword;
            await user.save();

            return {
                success: true,
                message: 'Password updated successfully',
            };
        },
        // __________________________________________________________________________

        // New Mutation to upload user image
        uploadImage: async (_, { userId, file }) => {
            try {
                // Extract the file data
                const { createReadStream, filename } = await file;
        
                // Define the destination path in MinIO
                const bucketName = 'carrental'; // Ensure this bucket exists
                const filePath = `user-images/${userId}/${filename}`;
        
                // Create a stream to upload the file to MinIO
                const stream = createReadStream();
        
                // Upload the file to MinIO
                await minioClient.putObject(bucketName, filePath, stream, stream.length, {
                    'Content-Type': 'image/jpeg', // Set appropriate content type
                });
        
                // Construct the file URL
                const fileUrl = `http://localhost:${minioClient.port}/${bucketName}/${filePath}`;
        
                // Find the user and update the image URL in the database
                const user = await User.findByPk(userId);
                if (!user) {
                    throw new Error('User not found');
                }
        
                // Update the user's imageUrl in the database
                user.imageUrl = fileUrl;
                await user.save();
        
                return {
                    success: true,
                    message: 'Image uploaded and URL saved successfully',
                    fileUrl,
                };
            } catch (error) {
                console.error('Error uploading image:', error);
                return {
                    success: false,
                    message: 'Failed to upload image',
                    fileUrl: null,
                };
            }
        }
        // __________________________________________________________________________
        
    },
};

export default userResolvers;
