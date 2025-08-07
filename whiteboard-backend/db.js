const mongoose = require('mongoose');
require("dotenv").config();

const mongoURL = process.env.MONGODB_URL;

const connectToDatabase = async () => {
    try{
        await mongoose.connect(mongoURL);
        console.log('Connected to the database');
    }
    catch (error){
        console.error(`Error connecting to the database: ${error}`);
    }
};

module.exports = connectToDatabase;

