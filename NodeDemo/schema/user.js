var mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const configs = require('../helper/configs')

const schema = new mongoose.Schema({
    email:String,
    userName: String,
    password: String,
    role:{
        type: String,
        enum: ['admin','user','publisher'],
        default: 'user'
    }
});

schema.pre('save',function(){
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
})

schema.methods.getJWT = function () {
    var token = jwt.sign({ id: this._id, role: this.role }, configs.SECRET_KEY,
        { expiresIn: configs.EXP });
    return token;
} 
schema.statics.checkLogin = async function (userName, password) {
    if (!userName || !password) {
        return { err: 'Hay nhap day du username va password' };
    }
    var user = await this.findOne({userName:userName});
    if (!user) {
        return { err: 'userName khong ton tai' };
    }
    var result = bcrypt.compareSync(password, user.password);
    if (!result) {
        return { err: 'password sai' };
    }
    console.log(user);
    return user;
}
module.exports = mongoose.model('user', schema);;

