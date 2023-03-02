const mongoose = require("mongoose")
mongoose.set('strictQuery', false);
const connectdb =  mongoose.connect("mongodb://127.0.0.1:27017/MagicBook",{useNewUrlParser: true})

module.exports={
    connectdb
}