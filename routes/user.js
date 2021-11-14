var express = require('express');
const { response } = require('../app');
var userHelper = require('../helpers/user-helper')
var router = express.Router();



/* GET home page. */
router.get('/', function(req, res, next) {

  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  // if(req.session.user){
    res.render('user/home', { title:"shopKart" ,currentUser:req.session.user,user:true});
  // }else{
  //   res.render('user/home', { title:"shopKart" ,user:true});
  // }
  
});


let loginERR=false;

router.get('/userLogin', function(req, res, next) {

  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  if(req.session.user){

    res.redirect('/');
    

  }else{
    res.render('user/userloginpage',{loginERR});
    loginERR = false;
    
  }
  
  
});


router.post('/loginOtp',(req,res)=>{

  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  res.render('user/otppage')


})


router.post('/login', function(req, res, next) {
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){

      req.session.userLoggedIn=true;
      req.session.userloggedInErr=false;
      req.session.user=response.user;
      res.redirect('/');

    }else{

      req.session.userLoggedIn=false;
      req.session.userloggedInErr=true;
      loginERR = response.msg;
      res.redirect('/userLogin');

    }
  })
  
  
});

let signUpErr=false;

router.get('/userSignUp', function(req, res, next) {

  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  if(!req.session.user){

    res.render('user/userSignUpPage',{signUpErr});
    signUpErr=false;
    
  }else{

    res.redirect('/')

  }



});



router.post('/signUpAction', function(req, res, next) {

  userHelper.doSignup(req.body).then((response)=>{
    console.log(response);
    if(response.status){

      res.redirect('/userSignUp');
      signUpErr = response.msg;
      
    }else{
      res.redirect('/userLogin');
    }


  })
  
});

router.get('/profileShorcut',(req,res)=>{

  if(req.session.user){
    res.render('user/profile')
  }else{
    res.redirect('/userLogin')
  }

})

router.get('/cart',(req,res)=>{

  if(req.session.user){
    res.render('user/cart');
  }else{
    res.redirect('/userLogin')
  }
  
})

router.get('/wishlist',(req,res)=>{
  
  if(req.session.user){
    res.render('user/wishlist');
  }else{
    res.redirect('/userLogin')
  }

})


router.get('/productDetails', function(req, res, next) {
  res.render('user/productDetailsPage',{ title:"shopKart", admin:false ,user:true});
});



router.get('/otpvalidation', function(req, res, next) {
  res.render('user/otppage',{ title:"shopKart", admin:false });
});

router.get('/userLogout',(req,res)=>{

  delete req.session.user;

  req.session.userLoggedIn=false;
  
  res.redirect('/')

})


module.exports = router;
