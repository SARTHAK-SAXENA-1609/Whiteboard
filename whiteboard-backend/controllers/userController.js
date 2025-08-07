const User = require("../models/userModel");

const addUser = async (req , res)=> {
    try{
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        res.status(200).json(savedUser);
    }
    catch(error) {
        res.status(400).json({error : error.message});
    }
}

const getUser = async (req , res)=> {
    try{
        const Users = await User.find();
        res.status(200).json(Users);
    }
    catch(error) {
        res.status(500).json({error : error.message});
    }
}

module.exports = {addUser , getUser};