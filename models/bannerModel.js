const mongoose = require('mongoose')

const banner = mongoose.Schema({
    Badge:{
        type:String,
        required:true
    },
    Name:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model("banner",banner)