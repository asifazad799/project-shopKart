var express = require('express');
const { response } = require('../app');
const adminHelper = require('../helpers/admin-helper');
var userHelper = require('../helpers/user-helper')
var router = express.Router();



let verifyLogin = (req,res,next)=>{

  if(!req.session.user){
    res.redirect('/userLogin')
  }else{
    next()
  }



}


/* GET home page. */
router.get('/', function( req, res, next) {

  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  // if(req.session.user){

  adminHelper.viewAllProducts().then((response)=>{

    res.render('user/home', { title:"shopKart" ,currentUser:req.session.user,user:true,products:response});

  })

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

router.get('/otpResend',(req,res)=>{

  client.verify
      .services(serviceId)
      .verifications.create({
        to:`+91${req.query.phonenumber}`,
        channel:"sms"
      })
      .then((resp)=>{
        
        console.log('asif')
        // console.log(resp);
        // res.status(200).json({resp});
        let valid = true;
        res.json(valid)})

  


})


router.post('/loginOtp',(req,res)=>{

  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  let userMobile = req.body.mobile;

  console.log('sdfghjk')

  userHelper.otpLogin(userMobile).then((response)=>{

    if(response.userFound){

      // console.log(response)
      client.verify
      .services(serviceId)
      .verifications.create({
        to:`+91${req.body.mobile}`,
        channel:"sms"
      })
      .then((resp)=>{
        
        console.log('asif')
        // console.log(resp);
        // res.status(200).json({resp});
        res.render('user/otppage',{userMobile})})

    }else{

      loginERR = "Mobile number did not found"

      res.redirect('/userLogin')

    }


    
      // console.log(userMobile)

  })
   
  
})
  



router.get('/otpConfirm',(req,res)=>{

  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  // res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  console.log('iuiyiyg')
  let phoneNumber = req.query.phonenumber;
  console.log(phoneNumber)
   let otpNumber = Number(req.query.otpnumber);
//  typeof(otpNumber)
   client.verify
   .services(serviceId)
   .verificationChecks.create({
     to:"+91"+phoneNumber,
     code:otpNumber
   }).then((resp=>{
     console.log('asiffffffff')
     if(resp.valid){
          userHelper.otpLogin(phoneNumber).then((response)=>{
          // console.log(response.user);
          req.session.user = response.user;
          // console.log(req.session.user);
          req.session.userLoggedIn = true;
          
          let valid = true;
          res.send(valid);
       })
     }else{
       let valid = false;

       res.send(valid);
     }
   }));



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

let signedUpUserData = null; 

router.post('/signUpAction', function(req, res, next) {

  
    // console.log(req.body)

    userHelper.signUpUserVerification(req.body).then((response)=>{
      
      
      // console.log(response);

      if(response.userFound){

        signUpErr="User already exist";

        res.redirect('/userSignUp');

      }else{

        signedUpUserData = req.body;

        // console.log(signedUpUserData.mobile);

        let userMobile = signedUpUserData.mobile;

        // console.log(response)
      client.verify
      .services(serviceId)
      .verifications.create({
        to:`+91${req.body.mobile}`,
        channel:"sms"
      })
      .then((resp)=>{
        
        // console.log('asif')
        // console.log(resp);
        // res.status(200).json({resp});
        res.render('user/signUpOtp',{userMobile})})

        // res.render('user/signUpOtp',{})
       

        
         
      }





    })

      
});

router.get('/signOtpConfirm',(req,res)=>{

  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  // console.log('iuiyiyg')
  let phoneNumber = req.query.phonenumber;
  // console.log(phoneNumber)
   let otpNumber = Number(req.query.otpnumber);
//  typeof(otpNumber)
   client.verify
   .services(serviceId)
   .verificationChecks.create({
     to:"+91"+phoneNumber,
     code:otpNumber
   }).then((resp=>{
    //  console.log('asiffffffff')
     if(resp.valid){

            userHelper.doSignup(signedUpUserData).then((response)=>{
            console.log(response);
            if(response){
        
              

              let valid = true;
              res.send(valid);

            }
          })

          
          
       
     }else{
       let valid = false;

       res.send(valid);
     }
   }));



})



// router.post('/signUpAction', function(req, res, next) {

//   userHelper.doSignup(req.body).then((response)=>{
//     console.log(response);
//     if(response.status){

//       res.redirect('/userSignUp');
//       signUpErr = response.msg;
      
//     }else{
//       res.redirect('/userLogin');
//     }


//   })
  
// });

router.get('/profileShorcut',verifyLogin,(req,res)=>{

  if(req.session.user){
    res.render('user/profile')
  }else{
    res.redirect('/userLogin')
  }

})

router.get('/cart',(req,res)=>{

  if(req.session.user){
    res.render('user/cart',{currentUser:req.session.user,user:true});
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
