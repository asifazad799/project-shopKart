var express = require('express');
var router = express.Router();
var fs= require('fs');

const { response } = require('../app');
var adminHelper = require('../helpers/admin-helper')

let adminLoginVerify=(req,res,next)=>{

  if(req.session.admin){
    
    
    next()

  }else{
    
    res.redirect('/admin/adminLogin')

  }

}

var admin = {email:"asif@mail.com",password:"12345678"};


/* GET users listing. */

var Err = null;

var currentAdmin=false;

router.get('/',adminLoginVerify,function(req, res, next) {

  // if(req.session.admin){

    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    
    res.render('admin/adminDashboard',{admin:true,currentAdmin});

  // }else{

    // res.redirect('/admin/adminlogin')

  // }

  
});

var passwordErr = false;
var emailErr = false;

router.get('/adminlogin', function(req, res, next) {

  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  if(!req.session.admin){
    
    
    res.render('admin/adminLogin',{adminLoginPage:true,passwordErr,emailErr,admin:true,currentAdmin});
    
    passwordErr=false;
    emailErr = false;
    
  }else{
    
    res.redirect('/admin/')
  }
  
});


router.post('/login', function(req, res, next) {

  if(req.body.email==admin.email){

    if(req.body.password==admin.password){
      
      req.session.adminLoggenIn=true;
      req.session.adminLoggedInErr=false;
      req.session.admin=admin;
      currentAdmin=admin;
      req.body.admin=true;
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


router.get('/viewAllUsers',(req,res)=>{

  adminHelper.getAllUsers().then((response)=>{

    console.log(response)
    res.render('admin/viewAllUsers',{admin:true,users:response})


  })
  

})

router.post('/blockUser',(req,res)=>{
  
  // console.log(req.body)
  let user1 = req.body.userId;
  adminHelper.blockUser(user1)
  res.json({valid:true})


})
router.get('/viewAllBlockedUsers',(req,res)=>{

  adminHelper.getAllBlockedUser().then((response)=>{
    
    // console.log(response) 
    res.render('admin/viewAllBlockedUsers',{admin:true,users:response})

  })

})

router.get('/adminProfileShorcut',adminLoginVerify,(req,res)=>{

  res.render('admin/adminprofile',{admin:true,currentAdmin})

})


router.get('/categoryManagement',adminLoginVerify,(req,res)=>{

  adminHelper.getCategoryTable().then((response)=>{

    

      res.render('admin/categorymanagement',{admin:true,currentAdmin,Err,catData:response})
      Err = null;


    

  })

  
})

router.get('/orderManagement',adminLoginVerify,(req,res)=>{

  adminHelper.getAllOrders().then((response)=>{

    console.log(response)

    res.render('admin/orders',{admin:true,response,currentAdmin})

  })
  

})

router.post('/updateOrderStatus',adminLoginVerify,(req,res)=>{

  let verifyData = req.body.orderStatus

  

  

  // console.log(verifyData)

  if(verifyData == 'placed'||verifyData == 'shipped'||verifyData == 'Canceled'||verifyData == 'Delivered'){

    adminHelper.updateOrderStatus(req.body).then((response)=>{

      if(response.delivered){

        res.json({delivered:true})
        
      }else if(response.canceld){

        res.json({canceled:true})

      }else if(response.usercanceld){

        res.json({usercanceld:true})

      }
      else{
        
        res.json({valid:true})

      }
      
    })
  }else{
    
    res.json({invalid:true})

  }
  
})

  
  
router.get('/allOrderedProduct',adminLoginVerify,(req,res)=>{
  
  //console.log(req.query) 

  adminHelper.getOrderedProduct(req.query).then((response)=>{

    
    //console.log(response)
    res.render('admin/orderedProduct',{admin:true,response,currentAdmin})

  })


})

router.post('/delete-subcategory',adminLoginVerify,(req,res)=>{

  adminHelper.deleteSubCat(req.body).then(()=>{

    

      res.json({status:true})
    


  })

})

router.post('/delete-category',adminLoginVerify,(req,res)=>{

  adminHelper.deleteCat(req.body).then(()=>{

    

      res.json({status:true})
    


  })

})


router.post('/addNewCategory',adminLoginVerify,(req,res)=>{

  adminHelper.addCategory(req.body).then((response)=>{

    if(response.subExist){
      
      
      Err = response.msg;
      res.redirect('/admin/categoryManagement')
      
    }else if(response.newCategory){

      Err = response.msg
      res.redirect('/admin/categorymanagement')

    }else{


      Err = response.msg;
      res.redirect('/admin/categorymanagement')
    }

  });

  //res.send('added');


  
})

//brand managemant

let brandErr = null; 

router.get('/brandmanagement',adminLoginVerify,(req,res)=>{

  adminHelper.getBrand().then((response)=>{

    res.render('admin/brandManagement',{admin:true,brandErr,data:response,currentAdmin});
    brandErr = null;

    

  })

})



router.post('/deleteBrand',adminLoginVerify,(req,res)=>{

  adminHelper.deleteBrand(req.body).then((response)=>{


    if(response){
      fs.unlink('./public/images/brandSymbols/'+req.body.brandId+'.png',(err)=>{
        if(err){

          console.log('error in deleting brand symbol')
          brandErr = "deleting brand Symbel failed";
          res.redirect('/admin/brandmanagement');

        }
        else
        {

          barandErr = "Brand deleted"
          res.json({status:true});
        }
      })
    }else{

      barandErr = "Data did not found"
      res.json({status:true});

    }
    
    
   

  })

})

router.post('/addNewBrand',adminLoginVerify,(req,res)=>{

  // adminHelper.addNewBrand(req.body,(result)=>{


  //   //brandErr = response.msg;
  //   res.redirect('/admin/brandmanagement');


  // })
  adminHelper.addNewBrand(req.body).then((response)=>{


    if(response.brand){

      brandErr = response.msg
      // console.log(response.data.insertedId+'')
  
      res.redirect('/admin/brandmanagement')
  
    }else{

      
      let brandSymbol = req.files.image1;

      let brandId = response.data.insertedId;

      brandSymbol.mv('./public/images/brandSymbols/'+brandId+'.png',(err,done)=>{
        if(!err){
          console.log('brand not symbol added')
          brandErr = response.msg;
          res.redirect('/admin/brandmanagement')
        }else{
          brandErr = "photo not added";
          res.redirect('/admin/brandmanagement')
          console.log('brand symbol added')
        }
      })
      

    }
  
  })
})

 

     

    
let pErr=null;
  

router.get('/addNewProduct',adminLoginVerify,(req,res)=>{

  adminHelper.getBrand().then((brandresponse)=>{

    if(brandresponse){
      adminHelper.getCategoryTable().then((catresponse)=>{

        if(catresponse){

          res.render('admin/addNewProduct',{admin:true,brandData:brandresponse,catData:catresponse,pErr,currentAdmin})
          pErr= null;

        }


      })



    }else{

      ProductdErr="Brands did not get"
      res.render('admin/addNewProduct',{admin:true,brandData:response,pErr,currentAdmin})

    }

  })

})

router.get('/addNewVarient',(req,res)=>{

  // console.log(req.query.product);
  let product = req.query.product;

  res.render('admin/addNewVarient',{admin:true,product,currentAdmin})


})
  






// router.post('/addNewVarient',(req,res)=>{

//   // console.log(req.query.product);

//   let product = req.query.product;

//   let varient = req.body;

//   adminHelper.AddNewVarient(product,varient)
  


// })

router.post('/addNewProduct',adminLoginVerify,(req,res)=>{

  adminHelper.addNewProduct(req.body).then((response)=>{

    if(response){

      console.log(response.varId)

      let prId = response.varId;

    

      let prImg1 = req.files.image1;
      let prImg2 = req.files.image2;
      let prImg3 = req.files.image3;
      let prImg4 = req.files.image4;

      prImg1.mv('./public/images/product/productvarients/'+prId+'_1'+'.png',(err,done)=>{
        if(!err){

          prImg2.mv('./public/images/product/productvarients/'+prId+'_2'+'.png',(err,done)=>{

            if(!err){

              prImg3.mv('./public/images/product/productvarients/'+prId+'_3'+'.png',(err,done)=>{

                if(!err){

                  prImg4.mv('./public/images/product/productvarients/'+prId+'_4'+'.png',(err,done)=>{

                    if(!err){

                      pErr=response.msg;
                      res.redirect('/admin/addNewProduct')


                    }else{
                      pErr="Image did not added";
                      res.redirect('/admin/addNewProduct')
                    }

                  })
                }else{

                  pErr="Image did not added";
                      res.redirect('/admin/addNewProduct')
                }

              })

            }else{

              pErr="Image did not added";
                      res.redirect('/admin/addNewProduct')
            }
          })

        }else{

          pErr="Image did not added";
                      res.redirect('/admin/addNewProduct')
        }
      })


      
      
    }
    
  })


})

let productErr = null;

router.get('/viewproducts',adminLoginVerify,(req,res)=>{

  adminHelper.viewAllProducts().then((response)=>{

    

      // console.log(response.varientId)
      // console.log(response[1].productVarients._id)
      // console.log(response.productdata)
      // let varientId =response.varientId
      // console.log(varientId+""); 
      res.render('admin/viewAllProducts',{admin:true,productData:response,productErr,currentAdmin})

      productErr = null;
    


  })

  

})

// router.get('/find-sizes',(req,res)=>{

//   let sizes = ['S','m'];

//   res.send(sizes);

// })
router.post('/deleteproduct',adminLoginVerify,(req,res)=>{

  console.log(req.body)

  adminHelper.deleteProduct(req.body).then((response)=>{


    if(response.found){

      let imgName= req.body.varientId;
      
      // console.log(imgName)

      // imgName.filter(x=> console.log(x))
  
      
      for(let i=1 ; i<=4 ; i++){
        
        fs.unlink('./public/images/product/productvarients/'+imgName+'_'+[i]+'.png',(err)=>{
          
          if(err){

            console.log(err)

          }else{

            console.log('no errors')

          }


        })

      }
      
      productErr = "Product Deleted succecfully";

      res.json({status:true})
            
            // res.redirect('/admin/viewproducts')
    }else{


      productErr = "Product did not Deleted";
      res.json({status:true})
  
      // res.redirect('/admin/viewproducts')
  
  
    }}
    
    )

})

 
router.get('/editProduct',adminLoginVerify,(req,res)=>{

  adminHelper.editProducts(req.query).then((response)=>{

    let product = response.b
    adminHelper.getBrand().then((brandresponse)=>{

      let brandData = brandresponse;

      adminHelper.getCategoryTable().then((catResponse)=>{

        let catData = catResponse;

        // console.log(catData)


        res.render('admin/editProduct',{admin:true,product:product,brandData,catData,currentAdmin})

      })

      // console.log(product)
      

    })

  })
    
})

router.get('/editVarients',adminLoginVerify,(req,res)=>{


  // console.log(req.query);

  let product = req.query.product;
  let subcategory = req.query.subcategory

  console.log(subcategory);

  adminHelper.varientEdit(req.query).then((response)=>{

    console.log(response.size);


    res.render('admin/varientEdit',{admin:true,varientData:response,product,currentAdmin,subcategory})

  })



})

router.post('/editVarients',adminLoginVerify,(req,res)=>{

  // console.log(req.query);
  console.log(req.body);

  
  
  
  
  adminHelper.varientUpdate(req.query,req.body).then((response)=>{
    
  let prImg1 = req.files?.image1;
  let prImg2 = req.files?.image2;
  let prImg3 = req.files?.image3;
  let prImg4 = req.files?.image4;
  let varientId = req.query.varientId;

  // console.log(prImg1)
  // console.log(prImg2)
  // console.log(prImg3)
  // console.log(prImg4)

  

    if(prImg1){
      
      fs.unlink('./public/images/product/productvarients/'+varientId+'_1.png',(err,done)=>{
  
        if(!err){
          
          prImg1.mv('./public/images/product/productvarients/'+varientId+'_1.png',(err,done)=>{
            console.log('image updated');
          })
  
        }else{
          console.log('image not updated');
        }
      })
  
    }

    if(prImg2){
      
      fs.unlink('./public/images/product/productvarients/'+varientId+'_2.png',(err,done)=>{
  
        if(!err){
          
          prImg2.mv('./public/images/product/productvarients/'+varientId+'_2.png',(err,done)=>{
            console.log('image updated');
          })
  
        }else{
          console.log('image not updated');
        }
      })
  
    }

    if(prImg3){
      
      fs.unlink('./public/images/product/productvarients/'+varientId+'_3.png',(err,done)=>{
  
        if(!err){
          
          prImg3.mv('./public/images/product/productvarients/'+varientId+'_3.png',(err,done)=>{
            console.log('image updated');
          })
  
        }else{
          console.log('image not updated');
        }
      })
  
    }
    if(prImg4){
      
      fs.unlink('./public/images/product/productvarients/'+varientId+'_4.png',(err,done)=>{
  
        if(!err){
          
          prImg4.mv('./public/images/product/productvarients/'+varientId+'_4.png',(err,done)=>{
            console.log('image updated');
          })
  
        }else{
          console.log('image not updated');
        }
      })
  
    }
  
   

    res.redirect('/admin/viewproducts')
    // res.json({status:true})

  })



  


})



router.post('/editProduct',adminLoginVerify,(req,res)=>{

  let data = req.body;
  let productId = req.query.productId;
  
  // console.log(productId);
  
  adminHelper.upadateProduct(data,productId).then((response)=>{

    

    res.redirect('/admin/viewproducts')

  })



})

  



router.get('/find-subcategory',adminLoginVerify,(req,res)=>{

  adminHelper.getSubCategoryTable(req.query).then((response)=>{

    // console.log(response)
    
    res.send(response)

  })
  


})

//Ofer management

router.get('/viewAllOffers',(req,res)=>{

  adminHelper.getCatOffers().then((response)=>{
    
    //console.log(response)
    res.render('admin/viewAllOffers',{admin:true,currentAdmin,response})

  })
  

})

let sameOfferErr = false; 

router.get('/addNewOffer',(req,res)=>{

  adminHelper.getCategoryTable().then((catresponse)=>{
    

    res.render('admin/addNewOffers',{admin:true,currentAdmin,catData:catresponse,sameOfferErr:sameOfferErr})
    sameOfferErr = false;

  })
  

})

router.post('/addNewCatOffer',(req,res)=>{
  
  //console.log(req.body)
  adminHelper.addNewCatOffer(req.body).then((response)=>{

    if(response.sameExist){
      
      sameOfferErr = true;
      res.redirect('/admin/addNewOffer')

    }else{
      
      sameOfferErr = false
      res.redirect('/admin/viewAllOffers')

    }
  })

})

// console.log(req.files)


router.get('/adminLogout',(req,res)=>{

delete req.session.admin;

req.session.adminLoggenIn = false;

res.redirect('/admin/adminlogin')

})

module.exports = router;

