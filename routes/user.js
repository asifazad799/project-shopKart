var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('user/home', { title:"shopKart", admin:false ,user:true});
});
router.get('/userLogin', function(req, res, next) {
  res.render('user/userloginpage');
});
router.get('/userSignUp', function(req, res, next) {
  res.render('user/userSignUpPage');
});
router.get('/productDetails', function(req, res, next) {
  res.render('user/productDetailsPage',{ title:"shopKart", admin:false ,user:true});
});
router.get('/otpvalidation', function(req, res, next) {
  res.render('user/otppage',{ title:"shopKart", admin:false });
});


module.exports = router;
