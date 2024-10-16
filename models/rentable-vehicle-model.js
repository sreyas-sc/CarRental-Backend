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
        unique: false,
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
        type: DataTypes.STRING,
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
    // This enables Sequelize to automatically add createdAt and updatedAt fields
    timestamps: true,
});


export default RentableVehicle;

// Sync the model with the database
const syncRentableVehicleTable = async () => {
    try {
        await RentableVehicle.sync(); // This creates the table if it doesn't exist
    } catch (error) {
        console.error('Error syncing vehicle table:', error);
    }
};

syncRentableVehicleTable(); // Call this function when your application starts


