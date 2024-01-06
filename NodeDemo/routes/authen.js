var express = require('express');
const { model } = require('mongoose');
const { use } = require('.');
const util = require('util')
var router = express.Router();
var responseData = require('../helper/responseData');
var modelUser = require('../models/user')
var validate = require('../validates/user')
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const configs = require('../helper/configs')
const sendmail = require('../helper/sendmail');
const { checkLogin, checkRole } = require('../middlewares/protect');

router.post('/register', validate.validator(),
  async function (req, res, next) {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      responseData.responseReturn(res, 400, false, errors.array().map(error => error.msg));
      return;
    }
    var user = await modelUser.getByName(req.body.userName);
    if (user) {
      responseData.responseReturn(res, 404, false, configs.REGISTER_FAIL_ALREADY_EXIST);
    } else {
      const newUser = await modelUser.createUser({
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
      })
      responseData.responseReturn(res, 200, true, newUser);
    }
  });
router.post('/login', async function (req, res, next) {
    var result = await modelUser.login(req.body.userName, req.body.password);
    if(result.err){
      responseData.responseReturn(res, 400, true, result.err);
      return;
    }
    var token = result.getJWT();
    res.cookie('tokenJWT',token,{
      expires:new Date(Date.now()+2*24*3600*1000),
      httpOnly:true
    });
    responseData.responseReturn(res, 200, true, token);
});

router.get('/logout', async function(req, res, next){
  res.cookie('tokenJWT','none',{
    expires:new Date(Date.now()+1000),
    httpOnly:true
  });
  responseData.responseReturn(res, 200, true, configs.LOGOUT_SUCCESS);
})

router.get('/me', async function (req, res, next) {
  var result = await checkLogin(req);
  if (result.err) {
      return responseData.responseReturn(res, 400, true, result.err);
  }

  console.log(result);
  var userRole = result.role;
  if (checkRole(userRole)) {
      var user = await modelUser.getOne(result.id);
      res.send({ "done": user });
  } else {
      responseData.responseReturn(res, 403, true, configs.NOT_ACCESS);
  }
});

router.post('/forgetPassword', async function(req, res, next){
  var email = req.body.email;
  var user = await modelUser.getByEmail(email);
  if(!user){
    return responseData.responseReturn(res, 400, true,configs.NOT_FOUND_USER);
  }
  console.log(user);
  user.addTokenForgotPassword();
  await user.save();
  try {
    sendmail.send(user.email,user.tokenForgot);
    console.log(user.tokenForgot);
    responseData.responseReturn(res, 200, true, configs.SEND_MAIL_SUCCESS);
  } catch (error) {
    user.tokenForgot = undefined;
    user.tokenForgotExp = undefined;
    responseData.responseReturn(res, 400, true, util.format(configs.SEND_MAIL_FAIL, error));
  }  
  return;
})

router.post('/resetPassword/:token', async function(req, res, next){
   var token = req.params.token;
   var password = req.body.password; 
   var user = await modelUser.getByTokenForgot(token);
   console.log(password);
   console.log(user);
   user.password = password;
   user.tokenForgot = undefined;
   user.tokenForgotExp = undefined;
 
   
   try { 
    await user.save();
    return responseData.responseReturn(res, 200, true, configs.RESET_PASSWORD_SUCCESS);
   } catch (error) {
    console.error(error);
    return responseData.responseReturn(res, 500, false, 'Internal Server Error');
  }
})
module.exports = router;