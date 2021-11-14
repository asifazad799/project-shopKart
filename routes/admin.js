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
    
    
    res.render('admin/adminLogin',{adminLoginPage:true,passwordErr,emailErr,admin:true});
    
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

router.get('/adminProfileShorcut',adminLoginVerify,(req,res)=>{

  res.render('admin/adminprofile',{admin:true,currentAdmin})

})


router.get('/categoryManagement',adminLoginVerify,(req,res)=>{

  adminHelper.getCategoryTable().then((response)=>{

    

      res.render('admin/categorymanagement',{admin:true,currentAdmin,Err,catData:response})
      Err = null;


    

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

    res.render('admin/brandManagement',{admin:true,brandErr,data:response});
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

      
      let brandSymbol = req.files.brandSymbol;

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

          res.render('admin/addNewProduct',{admin:true,brandData:brandresponse,catData:catresponse,pErr})
          pErr= null;

        }


      })



    }else{

      ProductdErr="Brands did not get"
      res.render('admin/addNewProduct',{admin:true,brandData:response,pErr})

    }

  })

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

    

      //console.log(response.varientData.productId)
      // console.log(response.productdata)

      res.render('admin/viewAllProducts',{admin:true,productData:response,productErr})

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


        res.render('admin/editProduct',{admin:true,product:product,brandData,catData})

      })

      // console.log(product)
      

    })

  })
    
})

router.get('/editVarients',(req,res)=>{

  res.render('admin/varientEdit',{admin:true})


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




  




    

   
  // console.log(req.files)

  
router.get('/adminLogout',(req,res)=>{

  delete req.session.admin;

  req.session.adminLoggenIn = false;

  res.redirect('/admin/adminlogin')

})
  
module.exports = router;











