// These files define the structure of your GraphQL API, such as the queries, mutations, and the types of data you can query.
// user-type-defs.js: Defines the user schema for GraphQL, detailing fields for the user entity and user-related queries or mutations.
import { gql } from 'apollo-server-express';

const userTypeDefs = gql`
    scalar Upload    

    type User {
        id: ID!
        name: String!
        email: String!
        password: String!
        phone: String!
        city: String!
        country: String!
        state: String!
        imageUrl: String
    }

    type RegisterResponse {
        token: String!
        user: User!
    }
    
    type UploadResult {
        success: Boolean!
        message: String!
        fileUrl: String
    }


    input UpdateUserInput {
        name: String
        email: String
        phone: String
        city: String
        state: String
        country: String
        imageUrl: String
    }


    type OTPResponse {
        success: Boolean!
        message: String!
    }

    type AuthPayload {
        token: String!
        user: User!
    }

    type LoginResponse {
        token: String!
        user: User
        status: Int!
        message: String
    }

    type ImageUploadResponse {
    success: Boolean!
    message: String!
    fileUrl: String
    }

    type ChangePasswordResponse {
        success: Boolean!
        message: String!
    }

    type UploadImageResponse {
        success: Boolean!
        message: String
        fileUrl: String
    }

    type Query {
        getAllUsers: [User!]!
        login(email: String!, password: String!): LoginResponse!  # Updated return type
        getUserImage(userId: ID!): String
    }

    type Mutation {
        register(name: String!, email: String!, password: String!, phone: String!, city: String!, country: String!, state: String!): RegisterResponse!
        
        login(email: String!, password: String!): LoginResponse!  

        sendOTP(phone: String!): OTPResponse!

        verifyOTP(phone: String!, otp: String!): OTPResponse!     
        
        updateUser(id: ID!, input: UpdateUserInput!): User!

        changePassword(userId: ID!, currentPassword: String!, newPassword: String!): ChangePasswordResponse!
        
        uploadImage(userId: ID!, file: Upload!): ImageUploadResponse!

        }
`;

export default userTypeDefs; 
