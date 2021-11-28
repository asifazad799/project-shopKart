const { ObjectId } = require('bson');
var express = require('express');
const { response } = require('../app');
const adminHelper = require('../helpers/admin-helper');
var userHelper = require('../helpers/user-helper')
var router = express.Router();
var paypal = require('paypal-rest-sdk')




let verifyLogin =(req,res,next)=>{


  if(!req.session.user){

    res.redirect('/userLogin')

  }else{

    userHelper.blockedStatus(req.session.user._id).then((response)=>{

      if(response.blocked){

        // delete req.session.user;
  
        // req.session.userLoggedIn=false;

        res.redirect('/userLogout')
  
      }else{
  
        next()
      }

    })
    

  }
}
  
router.get('/',async function( req, res, next) {

  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  let userCartCount = 0;
  if(req.session.user){

    userCartCount = await userHelper.getCartCount(req.session.user._id)
  }
  
  
  
  
  adminHelper.viewAllProducts().then((response)=>{
    
    // if(req.session.user){
      
    //   userHelper.verifyCartStatus(req.session.user._id,response).then((response)=>{ })
      
    // }
    
    // console.log(response.productVarients)
    res.render('user/home', { title:"shopKart" ,currentUser:req.session.user,user:true,products:response,userCartCount});

  })

  
  
});



    


  
 

    


/* GET home page. */


let loginERR=false;

router.get('/userLogin', function(req, res, next) {

  userCartCount = 0;  

  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  if(req.session.user){

    res.redirect('/');
    
  }else{

         

    res.render('user/userloginpage',{loginERR,userCartCount});

    loginERR = false;
    
  }

  
  
});


/* otp resend */
 
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

let userNotFound = null;

router.get('/changePassword',verifyLogin,(req,res)=>{
  
  res.render('user/forgotPasswordMobile',{userNotFound})
  userNotFound = null;

})
  
router.post('/ChangePasswordOtp',verifyLogin,(req,res)=>{

  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  let userMobile = req.body.mobile;

  let user = req.session.user._id

  //console.log('sdfghjk')

  userHelper.changePasswordUserVerification(userMobile,user).then((response)=>{

    if(response.userFound){

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
        res.render('user/ChangePasswordOtpConfirm',{userMobile})})

    }else{

      userNotFound = "Mobile Number did not match"

      res.redirect('/changePassword')

    }
  
  })
})

router.get('/changePasswordOtpConfirm',verifyLogin,(req,res)=>{

  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  let phoneNumber = req.query.phonenumber;
  console.log(phoneNumber)
  let otpNumber = (req.query.otpnumber);
  //  typeof(otpNumber)
   client.verify
   .services(serviceId)
   .verificationChecks.create({
     to:"+91"+phoneNumber,
     code:otpNumber
   }).then((resp=>{
    //  console.log('asiffffffff')
     if(resp.valid){
         
        res.send({valid:true})

     }else{
       let valid = false;

       res.send(valid);
     }
   }));
})

  router.get('/resetPasswordPage',verifyLogin,(req,res)=>{

  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  res.render('user/resetPasswordPage')

})

  


router.post('/ResetPassword',verifyLogin,(req,res)=>{
  
  delete req.body.confirmPassword;
 
  
  userHelper.resetPassword(req.body.password,req.session.user._id).then((response)=>{
    
    passwordReseted=true;
    res.redirect('/profileShorcut')

  })
  

})
  




router.post('/loginOtp',(req,res)=>{

  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  let userMobile = req.body.mobile;

  //console.log('sdfghjk')

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
  // console.log('iuiyiyg')
  let phoneNumber = req.query.phonenumber;
  console.log(phoneNumber)
   let otpNumber = (req.query.otpnumber);
//  typeof(otpNumber)
   client.verify
   .services(serviceId)
   .verificationChecks.create({
     to:"+91"+phoneNumber,
     code:otpNumber
   }).then((resp=>{
    //  console.log('asiffffffff')
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
   let otpNumber =(req.query.otpnumber);
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
   
let addressAdded = false;
let adressUpdated = false;
let passwordReseted = false;
router.get('/profileShorcut',verifyLogin,async(req,res)=>{

  let userCartCount = 0;
  

    userCartCount = await userHelper.getCartCount(req.session.user._id)
    let address1 = await userHelper.getAddress(req.session.user._id)
    let user1 = await userHelper.getUser(req.session.user._id)
    // console.log(address1)
    res.render('user/profile',{userCartCount,currentUser:req.session.user,addressAdded,address1:address1,user1,adressUpdated,passwordReseted})
    addressAdded = false;
    adressUpdated = false;
    passwordReseted = false;
  

})

let addressErr = null;

router.get('/addNewAddress',verifyLogin,async(req,res)=>{

  let userCartCount = 0;
  userCartCount = await userHelper.getCartCount(req.session.user._id)
  res.render('user/addNewAddress',{userCartCount,currentUser:req.session.user,addressErr})
  addressErr = null;

})

router.post('/addNewAddress',verifyLogin,(req,res)=>{

  // console.log(req.body)
  
  userHelper.addNewAddress(req.body,req.session.user._id).then((response)=>{

    if(response.sameAdressExist){

      addressErr = response.msg
      res.redirect('/addNewAddress')

    }else{
      
      addressAdded = true;
      res.redirect('/profileShorcut')

  }
})
})

      


router.post('/deleteAddress',verifyLogin,(req,res)=>{
  
  // console.log(req.query)
  
  let addressId = req.body.address
  let user = req.session.user._id

  userHelper.deleteAddress(addressId,user).then((response)=>{

    res.json({valid:true})

  })
})

// let addressUpdateErr= false;

router.get('/editAddress',verifyLogin,(req,res)=>{
  
  //console.log(req.query)
  userHelper.editAddress(req.session.user._id,req.query.addressId).then(async(response)=>{
    let userCartCount = 0;
  

    userCartCount = await userHelper.getCartCount(req.session.user._id)
   
    
    // console.log(response)
    res.render('user/editAddress',{address:response,addressUpdateErr1:req.session.addressUpdateErr1,userCartCount,currentUser:req.session.user})
    // console.log(addressUpdateErr)
    req.session.addressUpdateErr1 = false;
    
  })

})

router.post('/updateAddress',verifyLogin,(req,res)=>{

  // console.log(req.body)
  userHelper.updateAddress(req.session.user._id,req.query.addressId,req.body).then((response)=>{

    if(response.sameAdressExist){

     
      req.session.addressUpdateErr1 = true;
      res.redirect('/editAddress?addressId='+req.query.addressId+'&upErr=1')

    }else{

      adressUpdated = true;
      res.redirect('/profileShorcut')

    }
  })
})

 



router.post('/addToCart',verifyLogin,(req,res)=>{

let productId=req.body.productId
let user = req.session.user._id
let subTotal = req.body.subTotal

// console.log(subTotal)
userHelper.cart(productId,user,subTotal).then((response)=>{

//console.log(response);

if(response.SameProductExist){

  res.json({valid:false})

}else{
  
  res.json({valid:true})

}
//if(response.newProductAdded)
})
})
 
router.get('/cart',verifyLogin,async(req,res)=>{

  

    userCartCount = await userHelper.getCartCount(req.session.user._id)
  
    let userId = req.session.user._id
    
    userCartCount = parseInt(userCartCount);

    let grandTotal = await userHelper.getGrandTotal(req.session.user._id)
    let cartEmpty  = false ;

    if(userCartCount>0){

      cartEmpty = false
      grandTotal = grandTotal[0].grandTotal
      grandTotal = parseInt(grandTotal)
  
    }else{

      cartEmpty = true
      grandTotal = 0

    }


    // console.log(grandTotal);

    userHelper.getCartItems(userId).then((response)=>{

      // console.log(response);

      // let quantity1 = response;

      // quantity1.map(value => console.log(value))

      res.render('user/cart',{currentUser:req.session.user,user:true,response,userCartCount,grandTotal:grandTotal,cartEmpty});

    })


 
})

router.get('/checkOut',verifyLogin,async(req,res)=>{

  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  let data = req.query 
  let address = await userHelper.getAddress(req.session.user._id)

  //console.log(address)
  let delCharge = 0;
  if(data.delivery=='express'){

     delCharge = 40

  }else{

    delCharge = 0

  }
  let userCartCount = await userHelper.getCartCount(req.session.user._id)
  let userId = req.session.user._id
  userHelper.getCartItems(userId).then((response)=>{

    res.render('user/checkout',{data,address,delCharge,response,userCartCount,currentUser:req.session.user})

  })


})

router.post('/checkOut',verifyLogin,(req,res)=>{
  
  res.json({valid:true})

})

router.post('/cartCountUpdate',verifyLogin,(req,res)=>{
//console.log(req.body)
  userHelper.changeCartQuantity(req.body).then(async(response)=>{



    res.json({valid:true})

  })

  
  
})

router.post('/placeOrder',verifyLogin,async(req,res)=>{
  
  // console.log(req.body)

  let paymentMethod = req.body.paymentMethod
  let finalTotal = parseInt(req.body.finalTotal) 



  
  if(paymentMethod == "COD"){
    let payId = "COD";
    userHelper.orders(payId,req.body,req.session.user._id).then((response)=>{
    
      // console.log(response.insertedId)
      //let orderId = response.insertedId
  
      userHelper.stockUpdate(response.insertedId).then((response)=>{
        
        console.log(paymentMethod)
        
        res.json({cod_valid:true})
  
  
      })
  
    })

    
  }else if(paymentMethod == "razorpay"){

    req.session.orderDetails = await req.body;

    //console.log(req.session.orderDetails)

    let payId  = new ObjectId()
    //console.log(payId+"asif azad")
    userHelper.generateRazorPay(payId,finalTotal).then((response)=>{
      
      // console.log('genarater')
      // console.log(response)
      res.json(response)

    })

  }else if(paymentMethod == "paypal"){

    req.session.orderDetails = await req.body;
    
    let create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://localhost:3000/success",
          "cancel_url": "http://localhost:3000/canceled"
      },
      "transactions": [{
          "item_list": {
              "items": [{
                  
                  "price": req.body.finalTotal,
                  "currency": "USD",
                  "quantity":1
              }]
          },
          "amount": {
              "currency": "USD",
              "total": req.body.finalTotal
          },
          "description": "Payment done is secure"
      }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
          throw error;
      } else {
          // console.log("Create Payment Response");
          console.log(payment);
          // res.send('test')
          for(let i = 0 ; i < payment.links.length ; i++){
            
            if(payment.links[i].rel === 'approval_url' ){
              
              // res.redirect(payment.links[i].href);
              let url = payment.links[i].href;

              res.json({paypal:true,url:url})

            }

          }
      }
    });

  }

});



router.post('/verifyPayment',verifyLogin,(req,res)=>{
  
  //console.log(req.body)
  //console.log('asif')
  userHelper.verifyPayment(req.body).then((result)=>{
    
    userHelper.orders(req.body['order[receipt]'],req.session.orderDetails,req.session.user._id).then((response)=>{
      //console.log(req.body['order[receipt]'])
      userHelper.stockUpdate(response.insertedId).then((response)=>{

        req.session.orderDetails=null;
        console.log('payment done');
        res.json({status:true})

      })

    })
  }).catch((err)=>{
    console.log(err)
    res.json({status:'payment failed'})

  })
})

router.get('/canceled',verifyLogin, async(req,res)=>{

  let userCartCount = await userHelper.getCartCount(req.session.user._id)
  
  res.render('user/orderErrorpage',{userCartCount,currentUser:req.session.user})

})
    
  




router.get('/success',verifyLogin,(req,res)=>{

  let total = req.session.orderDetails.finalTotal
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": total
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        // console.log(JSON.stringify(payment));
        //res.send('Success');
        userHelper.orders(paymentId,req.session.orderDetails,req.session.user._id).then((result)=>{

          userHelper.stockUpdate(result.insertedId).then((response)=>{

            req.session.orderDetails=null;
            let userCartCount = 0;
            res.render('user/orderSuccessPage',{currentUser:req.session.user,userCartCount})

          })

        })
    }
  });


})


router.get('/orderSuccessPage',verifyLogin,(req,res)=>{

  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  let userCartCount = 0;
  
  res.render('user/orderSuccessPage',{currentUser:req.session.user,userCartCount})

})

router.post('/removeCart',verifyLogin,(req,res)=>{

  
  let product = req.body.productVarientId;
  let userId = req.session.user._id
  //console.log(product); 

  userHelper.deleteCartItem(product,userId).then((response)=>{
    
    res.json({valid:true})

  })
})
  
router.get('/wishlist',verifyLogin,(req,res)=>{
  
  if(req.session.user){
    res.render('user/wishlist');
  }else{
    res.redirect('/userLogin')
  }

})


router.get('/productDetails',async function(req, res, next) {

  
  
  //console.log(req.query.productVerientId)
  userHelper.productDetailage(req.query.productVerientId).then(async(response)=>{
    
    let userCartCount = 0;

    if(req.session.user){
  
      userCartCount = await userHelper.getCartCount(req.session.user._id)
  
    }else{
      
      userCartCount = 0;

    }

    let relatedProducts = await userHelper.relatedProducts(response)

    // console.log(relatedProducts)
    
    res.render('user/productDetailsPage',{ title:"shopKart", admin:false ,user:true,response,relatedProducts,userCartCount,currentUser:req.session.user});


  })

});

router.post('/productAddToCart',verifyLogin,(req,res)=>{
  
  // console.log(req.body)
  if(req.session.user){

    userId = req.session.user._id;
    productId = req.body.productId;
    mrp = req.body.mrp;
    

    // console.log(req.body.productId)
    userHelper.cart(productId,userId,mrp).then((response)=>{
      
      if(response.SameProductExist){

        res.json({valid:false})

      }else{

        res.json({valid:true})

      }
      

    })

  }else{

    console.log('please log in')

  }
})
    
router.get('/myOrders',verifyLogin,async(req,res)=>{

  userCartCount = await userHelper.getCartCount(req.session.user._id)
  userHelper.getMyOrers(req.session.user._id).then((response)=>{
    
    // console.log(response)
    
    res.render('user/myOrders',{response,userCartCount,currentUser:req.session.user})

  })
  

})

router.post('/removeFromOrder',(req,res)=>{
  
  req.body.quantity = parseInt(req.body.quantity)

  //console.log(req.body)

  userHelper.removeFromOrder(req.body).then((response)=>{
    
    res.json({valid:true})

  })

})

  



// router.get('/otpvalidation', function(req, res, next) {
//   res.render('user/otppage',{ title:"shopKart", admin:false });
// });

router.get('/userLogout',(req,res)=>{

  cartCount = 0;
  delete req.session.user;

  req.session.userLoggedIn=false;
  
  res.redirect('/')

})


module.exports = router;
