const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        unique : true,
        validate : {
            validator : validator.isEmail,
            message : "Invalid email formate"
        }
    },
    password : {
        type : String, 
        required : true,
        validate : {
            validator : (value) => {
                validator.isStrongPassword(value , {
                    minLength: 8,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1
                })
            },
            message : 'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.'
        }
    },
    createdAt: {
        type: Date,            
        default: Date.now,     
    },
});

userSchema.pre('save' , async function (next) {
    if(!this.isModified('password'))return next();
    try{
        const salt = bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password , salt);
        next();
    }
    catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function(enteredPassword){
    return bcrypt.compare(enteredPassword , this.password);
}

const User = mongoose.model('User' , userSchema);

module.exports = User;

