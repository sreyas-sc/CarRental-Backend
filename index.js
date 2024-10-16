import dotenv from 'dotenv'; // Import dotenv for environment variables
dotenv.config(); // Load environment variables

import express from 'express';
import cors from 'cors'; // Import CORS middleware
import { ApolloServer } from 'apollo-server-express';
import userTypeDefs from './graphql/typeDefs/user-type-defs.js';
import userResolvers from './graphql/resolvers/user-resolvers.js';
import adminTypeDefs from './graphql/typeDefs/admin-type-def.js'; // Import admin typeDefs
import adminResolvers from './graphql/resolvers/admin-resolvers.js'; // Import admin resolvers
import sequelize from './models/db.js'; // Change this line to use default import
import { graphqlUploadExpress } from 'graphql-upload';

const app = express();

// Use CORS middleware to enable cross-origin resource sharing
app.use(cors());

// Add middleware for handling file uploads (must be added before Apollo middleware)
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

// Optional: Add middleware for body parsing
app.use(express.json());

// Combine type definitions and resolvers
const typeDefs = [userTypeDefs, adminTypeDefs];
const resolvers = [userResolvers, adminResolvers];

const server = new ApolloServer({ 
    typeDefs, 
    resolvers, 
    uploads: false, // Disable Apollo's built-in handling as we use graphqlUploadExpress


    context: ({req, res }) =>{
        const token = req.headers.authorization || '';
        return {token, req, res, session : req.session}
    }
});

// Function to start the server and connect to the database
const startServer = async () => {
    try {
        // Connect to the database using Sequelize
        await sequelize.authenticate();
        console.log('Database connection established.');

        // Start the Apollo server
        await server.start();

        // Apply Apollo middleware to the Express app
        server.applyMiddleware({ app });

        // Start listening for incoming requests on the specified port
        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => 
            console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`)
        );
    } catch (err) {
        // Log any errors that occur during server startup or database connection
        console.error('Unable to connect to the database:', err);
    }
};

// Start the server
startServer();
