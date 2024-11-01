import { DataTypes } from "sequelize";
import sequelize from "./db.js";


const Make = sequelize.define('Make', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    make: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

const syncMakeTable = async () => {
    try{
        await Make.sync();
    }catch(error){
        console.error('Error syncing Make table:', error);
    }
};

syncMakeTable();

export default Make;