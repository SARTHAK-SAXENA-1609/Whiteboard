const mongoose = require('mongoose');

const conectionUri = `mongodb+srv://sarsaxena1609:%23ss9343823445@whiteboard-cluster.o3c5g.mongodb.net/?retryWrites=true&w=majority&appName=WHITEBOARD-CLUSTER`

const connectToDatabase = async () => {
    try{
        await mongoose.connect(conectionUri);
        console.log('Connected to the database');
    }
    catch (error){
        console.error(`Error connecting to the database: ${error}`);
    }
};

module.exports = connectToDatabase;

