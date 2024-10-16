import { DataTypes } from 'sequelize';
import  sequelize  from './db.js';

const Vehicle = sequelize.define('Vehicle', {
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
});

export default Vehicle;


// Sync the model with the database
const syncVehicleTable = async () => {
    try {
        await Vehicle.sync(); // This creates the table if it doesn't exist
    } catch (error) {
        console.error('Error syncing vehicle table:', error);
    }
};

syncVehicleTable(); // Call this function when your application starts

