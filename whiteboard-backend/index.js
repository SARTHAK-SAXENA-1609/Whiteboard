const express = require("express");
const app = express();
const cors = require('cors');

app.use(cors());

app.get('/' , (req , res) => {
    console.log("get request");
})

app.listen(3030 , () => {
    console.log("listening on 3030");
})