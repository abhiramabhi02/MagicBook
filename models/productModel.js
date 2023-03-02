const { ObjectID } = require("bson")
const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")

const product = mongoose.Schema({

    Image:{
        type:String,
        required:true
    },
    Name:{
        type:String,
        required:true
    },
    Category:{
        type:ObjectId,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    Price:{
        type:Number,
        required:true
    },
    Stock:{
        type:Number,
        required:true
    },
    Rating:{ 
        type:Number
    }
})

module.exports = mongoose.model("Product",product)