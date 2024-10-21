// These files contain the logic for handling GraphQL queries and mutations. Resolvers fetch data based on the defined schema.
// user-resolvers.js: Handles user-specific operations like user registration, login, and profile management.

import bcrypt from 'bcrypt'; // Import bcrypt for hashing passwords
import User from '../../models/user-model.js';
import { createToken } from '../../utils/createToken.js'; 
import minioClient from '../../config/minioClient.js';
import { GraphQLUpload } from 'graphql-upload';
import { validateRegister, validateLogin, validateUpdateUser, validateChangePassword } from '../../requests/user.js';

const userResolvers = {

    
    Query: {

        // Query to get all the users
        getAllUsers: async () => {
            return await User.findAll();
        },
    },

    Mutation: {

        // Mutation for user registration
        register: async (_, { name, email, password, phone, city, country, state }) => {

            // Validation using Joi
            const { error } = validateRegister({ name, email, password, phone, city, country, state });
            if (error) {
                throw new Error(error.details[0].message);
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            return await User.create({ 
                name, 
                email, 
                password: hashedPassword,
                phone, 
                city, 
                country, 
                state 
            });
        },

        // Mutation for user login
        login: async (_, { email, password }) => {
            // Validate Login Input using user entered password and hashed password
            const { error } = validateLogin({ email, password });
            if (error) {
                throw new Error(error.details[0].message);
            }
            const user = await User.findOne({ where: { email } });

            
            if (!user) {
                throw new Error('User not found');  // Throw an error instead of returning null
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                throw new Error('Password does not match');  // Throw an error instead of returning null
            }
            // Create token for loggedin user
            const token = createToken(user.id);
            // Return both token and user information
            return { token, user };  
        },

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
        


    },
};

export default userResolvers;
