const mongoose = require("mongoose")
mongoose.set('strictQuery', false);
const connectdb =  mongoose.connect('mongodb://localhost:27017/magicbook')

const dbcon = ["mongodb+srv://abhiramabhinv2:Xpulse200@cluster0.7zeyv1z.mongodb.net/?retryWrites=true&w=majority",{useNewUrlParser: true}]

module.exports={
    connectdb
}