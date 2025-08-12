const express = require("express");
const app = express();
const cors = require('cors');
const connectToDatabase = require('./db');
const userRoutes = require("./routes/userRoutes");
const canvasRoutes = require("./routes/canvasRoutes");

connectToDatabase();

app.use(cors());
app.use(express.json())

app.use('/users' , userRoutes);
app.use('/canvas' , canvasRoutes);

app.listen(3030 , () => { 
    console.log("listening on 3030");
})  