// This directory contains your Sequelize models, which represent tables in your PostgreSQL database.

// user-model.js: Defines the schema for the user table, which may include fields like name, email, phone, password, etc.
// This directory contains your Sequelize models, which represent tables in your PostgreSQL database.

// user-model.js: Defines the schema for the user table, which includes fields like name, email, phone, password, etc.
import { DataTypes } from 'sequelize';
import sequelize from './db.js'; // Import your sequelize instance

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
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
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    // Additional options
    timestamps: true, // To automatically manage createdAt and updatedAt fields
});



// Sync the model with the database
const syncUsersTable = async () => {
    await User.sync(); // This creates the table if it doesn't exist
};

syncUsersTable(); // Call this function when your application starts

export default User;
