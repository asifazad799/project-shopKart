var express = require('express');
var router = express.Router();

var admin = {email:"asif@mail.com",password:"12345678"};

/* GET users listing. */

var currentAdmin=false;

router.get('/', function(req, res, next) {

  if(req.session.admin){

    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    
    res.render('admin/adminDashboard',{admin:true,currentAdmin});

  }else{

    res.redirect('/admin/adminlogin')

  }

  
});

var passwordErr = false;
var emailErr = false;

router.get('/adminlogin', function(req, res, next) {

  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  if(req.session.admin){
    
    res.redirect('/admin/')

  }else{

    res.render('admin/adminLogin',{adminLoginPage:true,passwordErr,emailErr});
  
    passwordErr=false;
    emailErr = false;
  
  }
  
});


router.post('/login', function(req, res, next) {

  if(req.body.email==admin.email){

    if(req.body.password==admin.password){
      
      req.session.adminLoggenIn=true;
      req.session.adminLoggedInErr=false;
      req.session.admin=admin;
      currentAdmin=admin;
      res.redirect('/admin/');

    }else{

      req.session.adminLoggenIn=false;
      req.session.adminLoggedInErr=true;
      passwordErr=true;
      res.redirect('/admin/adminlogin')

    }

  }else{

    req.session.adminLoggenIn=false;
    req.session.adminLoggedInErr=true;
    emailErr=true;
    res.redirect('/admin/adminlogin')

  }

  
});





module.exports = router;
