const express = require("express");
const app = express();
const cors = require('cors');
const connectToDatabase = require('./db');

connectToDatabase();

app.use(cors());

app.get('/data' , (req , res) => {
    res.json({ message: 'Hello from the server!' });
})

app.listen(3030 , () => { 
    console.log("listening on 3030");
})