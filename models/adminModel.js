const mongoose = require("mongoose")

const admin = mongoose.Schema({

    Firstname:{
        type:String,
        required:true
    },
    Lastname:{
        type:String,
        required:true
    },
    Email:{
        type:String,
        required:true
    },
    Password:{
        type:String,
        required:true
    }
    
})

module.exports = mongoose.model("admin",admin)