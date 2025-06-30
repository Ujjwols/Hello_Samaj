const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema= new mongoose.Schema({
    fullname:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        minlength:8,

    },
    phone:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
    province:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
    },
    district:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
    },
    

    role:{
        type:String,
        enum:["user","admin",],
        default:"user",
    },

})
const User=mongoose.model("User", userSchema);
module.exports=User;