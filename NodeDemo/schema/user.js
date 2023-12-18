var mongoose = require("mongoose");

const schema = new mongoose.Schema({
    email:String,
    userName: String,
    password: String
});

module.exports = mongoose.model('user', schema);;

