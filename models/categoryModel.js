const mongoose = require("mongoose")

const category = mongoose.Schema({

    Name:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model("category",category)