// This directory contains your Sequelize models, which represent tables in your PostgreSQL database.
// rentable-vehicle-model.js: Defines the schema for the RentableVehicles table

import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const RentableVehicle = sequelize.define('RentableVehicle', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    make: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    year: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    availability: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    transmission: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fuel_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    seats: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING(1000),
        allowNull: true,
    },
    primaryImageUrl: {
        type: DataTypes.STRING(5000),
        allowNull: true,
    },
    additionalImageUrls: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
    },
}, {
    // Enable soft deletes
    paranoid: true, // This will add a 'deletedAt' field
    timestamps: true,
});

// Sync the model with the database
const syncRentableVehicleTable = async () => {
    try {
        await RentableVehicle.sync(); // This creates the table if it doesn't exist
    } catch (error) {
        console.error('Error syncing vehicle table:', error);
    }
};

syncRentableVehicleTable(); // Call this function when your application starts

export default RentableVehicle;
