// This directory contains your Sequelize models, which represent tables in your PostgreSQL database.

// db.js: Initializes and configures Sequelize (the ORM used to interact with the PostgreSQL database) and connects to the database using credentials from config.js.
// db.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import config from '../config/config.js';

// Load environment variables
dotenv.config(); 

// Determine the current environment and get the corresponding config
const environment = process.env.NODE_ENV || 'development';
const configEnv = config[environment];

// Initialize Sequelize with the appropriate config
const sequelize = new Sequelize(configEnv.database, configEnv.username, configEnv.password, {
  host: configEnv.host,
  dialect: configEnv.dialect,
});

// Exporting the sequelize instance
export default sequelize; // This is correct for default export
