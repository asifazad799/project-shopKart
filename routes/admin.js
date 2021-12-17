const { Console } = require('console');
var express = require('express');
var router = express.Router();
var fs= require('fs');
const { resolve } = require('path');
const { order } = require('paypal-rest-sdk');
const Taskrouter = require('twilio/lib/rest/Taskrouter');

const { response } = require('../app');
var adminHelper = require('../helpers/admin-helper');
const userHelper = require('../helpers/user-helper');

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
    
    res.redirect('/admin/adminDashBoard');

  // }else{

    // res.redirect('/admin/adminlogin')

  // }

  
});

router.get('/adminDashBoard',async(req,res)=>{

  let orderCound= await adminHelper.getOrderCount()
  let totalProfit = await adminHelper.totalProfit()
  let UserCount = await adminHelper.getAllUsers();
  UserCount = UserCount.length;
  let topSellingProducts = await adminHelper.topSellingProducts()
  let currentDaySale=await adminHelper.currentDaySale()
  let percentage = await adminHelper.topSellingProductInPercentage()
  //console.log(percentage)
 
  res.render('admin/adminDashboard',{admin:true,currentAdmin,orderCound,totalProfit,UserCount,topSellingProducts,currentDaySale,percentage});

})

router.get('/getSalesTable',async(req,res)=>{
  
  await adminHelper.getPerDaySalesData().then(async(perDaySales)=>{
    
    await adminHelper.getOrderMethodsCount().then(async(paymentMethod)=>{
      
      await adminHelper.getBestSellingCat().then((catData)=>{

        res.json({perDaySales,paymentMethod,catData})
        
      })
     
      

    })
    
    // console.log(response)
    //console.log(response)
    // asifdate = response.dateArray;
    // count = response.salesCount;


  })


})

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

  console.log(req.query.product);
  let product = req.query.product;

  res.render('admin/addNewVarient',{admin:true,product,currentAdmin})


})
  






router.post('/addNewVarient',(req,res)=>{

  
  let product = req.query.product;
  
  let varient = req.body;
  console.log(req.query.product);

  adminHelper.AddNewVarient(product,varient)
  
})




router.post('/addNewProduct',adminLoginVerify,(req,res)=>{

  adminHelper.addNewProduct(req.body).then((response)=>{

    if(response){

      console.log(response.varId)

      let prId = response.varId;

    

      let prImg1 = req.files.image1;
      let prImg2 = req.files.image2;
      let prImg3 = req.files.image3;
      let prImg4 = req.files.image4;

      prImg1.mv('public/images/product/productvarients/'+prId+'_1'+'.jpg',(err,done)=>{
        if(!err){

          prImg2.mv('public/images/product/productvarients/'+prId+'_2'+'.jpg',(err,done)=>{

            if(!err){

              prImg3.mv('public/images/product/productvarients/'+prId+'_3'+'.jpg',(err,done)=>{

                if(!err){

                  prImg4.mv('public/images/product/productvarients/'+prId+'_4'+'.jpg',(err,done)=>{

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

router.get('/getVarients',(req,res)=>{

  //console.log(req.query)
  adminHelper.getVarients(req.query.product).then((response)=>{

    //console.log(response)
    let product = req.query.product
    res.render('admin/allVarients',{admin:true,currentAdmin,response,product})

  })


})



let productErr = null;

router.get('/viewproducts',adminLoginVerify,(req,res)=>{

  adminHelper.viewAllProducts().then((response)=>{

    

      res.render('admin/viewAllProducts',{admin:true,productData:response,productErr,currentAdmin})

      productErr = null;
    


  })

  

})

router.post('/deleteproduct',adminLoginVerify,(req,res)=>{

  console.log(req.body)

  adminHelper.deleteProduct(req.body).then((response)=>{


    if(response.found){

      let imgName= req.body.varientId;
      
  
  
      
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
  let productId = req.query.productId
  let product = req.query.product;
  let subcategory = req.query.subcategory

  console.log(subcategory);

  adminHelper.varientEdit(req.query).then((response)=>{

    console.log(response.size);


    res.render('admin/varientEdit',{admin:true,varientData:response,product,currentAdmin,subcategory,productId})

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
  
   
    let produtcId = req.query.productId
    res.redirect('/admin/getVarients?productId='+produtcId)
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

//Offer management

let catOfferChanged = false;

router.get('/viewAllOffers',(req,res)=>{

  adminHelper.getCatOffers().then((response)=>{
    
    //console.log(response)
    res.render('admin/viewAllOffers',{admin:true,currentAdmin,response,catOfferChanged})
    catOfferChanged = false;

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

router.get('/editCatOffer',(req,res)=>{

  adminHelper.editCatOffer(req.query.category).then((response)=>{

    adminHelper.getCategoryTable().then((catresponse)=>{
      

      res.render('admin/editCatOffer',{admin:true,currentAdmin,response,catData:catresponse})

    })
    

  }).catch((reject)=>{
    
    console.log('not edited')

  })

})

router.post('/deleteCatOffer',(req,res)=>{
  
  console.log(req.body)
  adminHelper.deleteCatOffer(req.body.category).then((response)=>{
    
    res.json({valid:true})

  })

})

router.post('/updateCatOffer1',(req,res)=>{
  
  let category = req.query.category;
  adminHelper.updateCatOffer(req.query.cafOfferId,category,req.body).then((response)=>{
  
    // console.log('catUpdate')
    catOfferChanged = true;
    res.redirect('/admin/viewAllOffers')

  })

})

let sameProductOfferErr = false;
let betterOfferInCatOffer = false;
router.get('/addNewProductOffer',(req,res)=>{
  
  adminHelper.viewAllProducts().then((response)=>{
    
    res.render('admin/AddNewProductOffer',{admin:true,currentAdmin,response,sameProductOfferErr,betterOfferInCatOffer})
    sameOfferErr = false; 

  })


})

router.post('/addNewProductOffer',(req,res)=>{
  
  adminHelper.addNewProductOffer(req.body).then(()=>{

    res.redirect('/admin/viewAllProductOffers')

  }).catch((response)=>{
    
    if(response.isAvailable){

      sameProductOfferErr = true;
      res.redirect('/admin/addNewProductOffer')

    }else if(response.betterOfferInCatOffer){
      
      betterOfferInCatOffer = true;
      res.redirect('/admin/addNewProductOffer')

    }

  })

})

router.get('/viewAllProductOffers',(req,res)=>{
  
  adminHelper.getAllProductOffer().then((response)=>{
    //console.log(response)
    res.render('admin/viewAllProductOffers',{currentAdmin,admin:true,response})

  }).catch(()=>{
    
    console.log('error')

  })


})

router.get('/editProductOffer',(req,res)=>{

  adminHelper.editProductOffer(req.query.productOffer).then((result)=>{
    
    adminHelper.viewAllProducts().then((response)=>{

      
      res.render('admin/editProductOffer',{admin:true,result:result,response,sameProductOfferErr})
      sameProductOfferErr=false
      

    })
    


  })

})

router.post('/updateProductOffer',(req,res)=>{
  
  console.log(req.query)
  adminHelper.updateProductOffer(req.query.offerId,req.body).then(()=>{
    
    res.redirect('/admin/viewAllProductOffers')    

  }).catch(()=>{
    
    sameProductOfferErr = true;
    res.redirect('/editProductOffer')

  })

})

router.get('/deleteProductOffer',(req,res)=>{
  
  console.log( req.query)
  adminHelper.deleteProductOffer(req.query).then((response)=>{

    
    res.json({valid:true})

  })


})
// console.log(req.files)

//banner management

router.get('/viewBanners',(req,res)=>{
  
  adminHelper.getAllBanners().then(async(bannerResponse)=>{
    
    let banner = []
    
    await bannerResponse.forEach((value)=>{
        
      //console.log(value.mainbanner)
      if(value.mainbanner){
        
        banner.push({

          bannreHeading:value.mainbanner.bannreHeading,
          bannerPosition:value.mainbanner.bannerPosition,
          whererToNavigate:value.mainbanner.whererToNavigate,
          category:value.mainbanner.category,
          product:value.mainbanner.product
    
        })

      }else if(value.bodybanner1){

        banner.push({

          bannreHeading:value.bodybanner1.bannreHeading,
          bannerPosition:value.bodybanner1.bannerPosition,
          whererToNavigate:value.bodybanner1.whererToNavigate,
          category:value.bodybanner1.category,
          product:value.bodybanner1.product
    
        })

      }else if(value.bodybanner2){

        banner.push({

          bannreHeading:value.bodybanner2.bannreHeading,
          bannerPosition:value.bodybanner2.bannerPosition,
          whererToNavigate:value.bodybanner2.whererToNavigate,
          category:value.bodybanner2.category,
          product:value.bodybanner2.product
    
        })

      }else if(value.bodybanner3){

        banner.push({

          bannreHeading:value.bodybanner3.bannreHeading,
          bannerPosition:value.bodybanner3.bannerPosition,
          whererToNavigate:value.bodybanner3.whererToNavigate,
          category:value.bodybanner3.category,
          product:value.bodybanner3.product
    
        })

      }

    
    })
    
    console.log(bannerResponse)
    res.render('admin/viewBanner',{admin:true,bannerResponse})
  })



})

let bannerExixst = false;
router.get('/addNewBanner',(req,res)=>{
  
  res.render('admin/addNewBanner',{admin:true,bannerExixst})
  bannerExixst = false

})

router.get('/find-banner-nav',(req,res)=>{

  let navLocation = req.query.navigate;
  
  if(navLocation=='product'){
    
    adminHelper.findProductList().then((result)=>{
      
      res.json(result)

    })
    
  }else if(navLocation=='category'){
    
    adminHelper.findCategoryList().then((result)=>{
      
      res.json(result)

    })

  }
    
})

router.post('/findOffer',(req,res)=>{
  
  //console.log(req.body.subSelect)
  adminHelper.getOffers(req.body.mainSelect,req.body.subSelect)
  .then((result)=>{
  // console.log(result[0])

    res.json({offer:result[0]})

  }).catch(()=>{
    
    console.log('no Offer')
    res.json({noOffer:true})

  })

})    

router.post('/addNewBanner',(req,res)=>{

  // console.log(req.body)
  // console.log(req.files)
  adminHelper.addNewBanner(req.body).then((response)=>{
    
    if(!response.exist){
      
      let imgName = req.body.bannerPosition

      let bnImg = req.files.bannerImage

      bnImg.mv('./public/images/bannersKart/'+imgName+'.webp',(err,done)=>{
        
        if(!err){
          
          res.redirect('/admin/viewBanners')

        }else{
          
          res.send('not added')

        }

      })

    }else{
      
      res.send('add image')

    }

  }).catch((result)=>{
    
    if(result.exist){

      bannerExixst = true;
      res.redirect('/admin/addNewBanner')
    }

  })

})

router.post('/deleteBanner',(req,res)=>{
  
  adminHelper.deleteBanner(req.body.bannerId).then((response)=>{
    
    if(response.notFound){
      
      console.log('not found')

    }else{

      fs.unlink('./public/images/bannersKart/'+response+'.webp',(err)=>{
        
        if(err){

          console.log(err)
          res.json({status:true})

        }else{

          console.log('banner deleted succefully')
          console.log(response)
          res.json({status:true})

        }

      })

    }
    

  })

})

router.get('/editBanner',(req,res)=>{
  
  adminHelper.editBanner(req.query.bannerId).then((response)=>{
    
    
    let banner = []
    
      
      if(response.bodybanner3){

        banner.push({
  
          _id:response._id,
          bannreHeading:response.bodybanner3.bannreHeading,
          bannerPosition:response.bodybanner3.bannerPosition,
          whererToNavigate:response.bodybanner3.whererToNavigate,
          category:response.bodybanner3.category,
          product:"product"
        })

      }else if(response.bodybanner2){

        banner.push({
  
          _id:response._id,
          bannreHeading:response.bodybanner2.bannreHeading,
          bannerPosition:response.bodybanner2.bannerPosition,
          whererToNavigate:response.bodybanner2.whererToNavigate,
          category:response.bodybanner2.category,
          product:"product"
  
        })

      }else if(response.bodybanner1){

        banner.push({
  
          _id:response._id,
          bannreHeading:response.bodybanner1.bannreHeading,
          bannerPosition:response.bodybanner1.bannerPosition,
          whererToNavigate:response.bodybanner1.whererToNavigate,
          category:response.bodybanner1.category,
          product:"product"
  
        })

      }else if(response.mainbanner){

        banner.push({
  
          _id:response._id,
          bannreHeading:response.mainbanner.bannreHeading,
          bannerPosition:response.mainbanner.bannerPosition,
          whererToNavigate:response.mainbanner.whererToNavigate,
          category:response.mainbanner.category,
          product:"product"
  
        })

      }

   
    console.log(banner)

    res.render('admin/editBanner',{admin:true,banner})

  })

})

router.post('/updateBanner',(req,res)=>{
  
  adminHelper.updateBanner(req.query.bannerId,req.body).then((response)=>{
    
    
    let bannerImg = req.files.bannerImage;
    // console.log(req.body,bannerImg)

    if(bannerImg){
      
      fs.unlink('./public/images/bannersKart/'+req.query.bannerPosition+'.webp',(err,donr)=>{
        
        if(!err){
          
          bannerImg.mv('./public/images/bannersKart/'+req.query.bannerPosition+'.webp',(err,done)=>{
            proUpdated = true
            console.log('image updated');
            res.redirect('/admin/viewBanners')
          })

        }else{
          
          console.log('bannerImage Not updated')
          res.redirect('/admin/editBanner')

        }

      })

    }else{
      
      res.redirect('/admin/viewBanners')

    }


  })

})

router.get('/coupons',(req,res)=>{
  
  adminHelper.getAllCoupons().then((response)=>{
    
    res.render('admin/coupons',{admin:true,response})

  })

})

router.get('/editCoupon',(req,res)=>{
  
  adminHelper.editCoupopn(req.query.couponId).then((response)=>{
    
    res.render('admin/editCoupon',{admin:true,response})

  })

})

router.post('/addNewCoupon',(req,res)=>{
  
  adminHelper.addNewCoupon(req.body).then((result)=>{
    
    res.redirect('/admin/coupons')

  })

})

router.post('/updateCoupon',(req,res)=>{
  
  adminHelper.updateCoupon(req.body,req.query.couponId).then((response)=>{
    
    res.redirect('/admin/coupons')

  })

})

let orderRedport = null;
let stockReport = null ;
let Order = false;
let stock = false;
router.get('/report',(req,res)=>{
  
  res.render('admin/reports',{admin:true,orderRedport,Order,stock,stockReport})
  Order = false
  stock = false
})

router.post('/getReport',(req,res)=>{
  
  console.log(req.body)
  if(req.body.type=='orders'){
    
    adminHelper.getOrderReport(req.body).then((response)=>{
      
      orderRedport = response
      Order = true
      res.redirect('/admin/report')

    })

  }else if(req.body.type=='stock'){
    
    adminHelper.getStock(req.body).then((response)=>{
      
      stock=true
      stockReport = response
      res.redirect('/admin/report')

    })
    

  }
  // res.send('asif')

})


router.get('/adminLogout',(req,res)=>{

delete req.session.admin;

req.session.adminLoggenIn = false;

res.redirect('/admin/adminlogin')

})

module.exports = router;

