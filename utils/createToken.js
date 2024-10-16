// Utility functions used across the project. It contains shared logic that can be reused in multiple places.
// createToken.js: Generates JSON Web Tokens (JWT) for user and admin authentication. It will typically take in user details and return a signed JWT token that can be used for verifying authenticated requests.
import jwt from 'jsonwebtoken';

export const createToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// If you're using CommonJS and want to keep the old syntax, you can keep the module.exports line commented out.
// module.exports = createToken; // Comment this out or remove it.
