// These files contain the logic for handling GraphQL queries and mutations. Resolvers fetch data based on the defined schema.
// user-resolvers.js: Handles user-specific operations like user registration, login, and profile management.

import bcrypt from 'bcrypt'; // Import bcrypt for hashing passwords
import User from '../../models/user-model.js';
import { createToken } from '../../utils/createToken.js'; 
import minioClient from '../../config/minioClient.js';
import { GraphQLUpload } from 'graphql-upload';

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
            console.log("the date from the database is ", name, email, password,  phone, city, country, state);


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
            const user = await User.findOne({ where: { email } });

            if (!user) {
                throw new Error('User not found');  // Throw an error instead of returning null
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                throw new Error('Password does not match');  // Throw an error instead of returning null
            }

            const token = createToken(user.id);
            return { token, user };  // Return both token and user information
        },

        // Mutation to update user profile detsils
        updateUser: async (_, { id, input }) => {
            console.log("The User id is", id)
            console.log("the  input is", input)

            try {
              
              // Ensure models.User exists
              if (!User) {
                throw new Error("User model is not available in context");
              }
          
              // Find the user by their primary key (ID)
              const user = await User.findByPk(id);
              if (!user) {
                throw new Error('User not found');
              }
          
              // Update user with new input data
              await user.update(input);
          
              return user;
            } catch (error) {
              console.error('Error updating user:', error);
              throw new Error('Failed to update user');
            }
        },


        // Mutation to update user password
        changePassword: async (_, { userId, currentPassword, newPassword }) => {
            console.log("New password",  newPassword)   
            console.log("Current password", currentPassword)
            
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
