// This file is responsible for managing your application’s 
// environment and database configurations (e.g., database name, 
// user, password, host, and port). It reads values from the .env file
//  and makes them available for the app.
const config = {
    development: {
        username: 'postgres',
        password: 'password',
        database: 'carrental',
        host: 'localhost',
        dialect: 'postgres',
    },
    // You can add other environments like production here if needed
};

export default config;