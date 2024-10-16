// This directory contains your Sequelize models, which represent tables in your PostgreSQL database.

// admin-model.js: Defines the schema (columns, types, and constraints) for the admin table in your database.


import { DataTypes } from 'sequelize';
import  sequelize  from './db.js';

const Admin = sequelize.define('Admin', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Sync the model with the database
const syncAdminTable = async () => {
    try {
        await Admin.sync(); // This creates the table if it doesn't exist
    } catch (error) {
        console.error('Error syncing admin table:', error);
    }
};

syncAdminTable(); // Call this function when your application starts


export default Admin;
