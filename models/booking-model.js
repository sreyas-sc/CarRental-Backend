import { DataTypes } from 'sequelize';
import sequelize from './db.js'; // Ensure you have your sequelize instance imported
import Vehicle from './vehicle-model.js';
import User from './user-model.js';
import RentableVehicle from './rentable-vehicle-model.js';

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    vehicleId: {
        type: DataTypes.INTEGER, // Change to INTEGER if Vehicle ID is an integer
        allowNull: false,
        references: {
            model: RentableVehicle,
            key: 'id',
        },
    },
    userId: {
        type: DataTypes.INTEGER, // Change to INTEGER if User ID is an integer
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    startDate: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    totalPrice: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    razorpayPaymentId: {
        type: DataTypes.STRING, // Add this field
        allowNull: true // or false based on your needs
    },
    razorpayOrderId: {
        type: DataTypes.STRING, // Add this field
        allowNull: true // or false based on your needs
    },
    razorpaySignature: {
        type: DataTypes.STRING, // Add this field
        allowNull: true // or false based on your needs
    }
});

// Define associations
Booking.belongsTo(RentableVehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

const syncBookingsTable = async () => {
    try {
        await Booking.sync(); // This creates the table if it doesn't exist
    } catch (error) {
        console.error('Error syncing vehicle table:', error);
    }
};

syncBookingsTable(); 

// Export the Booking model
export default Booking;









