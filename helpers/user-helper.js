   
var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectId;
const { response } = require("express");
const { ObjectId } = require("bson");
const { PRODUCTS } = require("../config/collection");

module.exports = {
    
   
    doSignup:(userData)=>{
      return new Promise(async(resolve,reject)=>{

        userData.password=await bcrypt.hash(userData.password,10)
        delete userData.confirmPassword;

        // let user = await db.get().collection(collection.USER_COLLECTION).findOne({$or:[{email:userData.email},{mobile:userData.mobile}]});
        

        
          
          

            await db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
  
                resolve(data);
    
              })
            
          
  
            
        
      })
    },
    blockedStatus:(userId)=>{
      return new Promise(async(resolve,reject)=>{

        let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
        console.log(user)
        if(user.blocked){

          resolve({blocked:true})
        }else{
          resolve({blocked:false})
        }
      })
    }
    ,
    doLogin:(userData)=>{
      return new Promise(async(resolve,reject)=>{


        let loginStatus = false;
        let response = {};

        let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email});
        if(user.blocked){

          resolve({status:false,msg:"User Blocked"});
          
        }else{

          if(user){
  
            bcrypt.compare(userData.password,user.password).then((status)=>{
              if(status){
                console.log('logged in');
                response.user=user;
                response.status=true;
                resolve(response)
              }else{
                console.log('Not logged in');
                resolve({status:false,msg:"Wrong password"});
              }
            })
          }else{
            console.log('user not found');
            resolve({status:false,msg:"User not found"});
          }
        }
      })
    },
    changePasswordUserVerification:(userMobile,userId)=>{
      
      return new Promise(async(resolve,reject)=>{

        let user = await db.get().collection(collection.USER_COLLECTION).findOne({$and:[{_id:objectId(userId)},{mobile:userMobile}]})
        
        //console.log(user)
        
        if(user){
          resolve({userFound:true})
        }else{
          resolve({userFound:false})
        }

      })

    },
    resetPassword:(password,userId)=>{

      return new Promise(async (resolve,reject)=>{

        password=await bcrypt.hash(password,10)
        // console.log(password)

        await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{password:password}}).then((result)=>{
          
          resolve()

        })



      })


    },

    otpLogin:(phoneNumber)=>{

      // console.log(phoneNumber)

      return new Promise(async(resolve,reject)=>{
        
          let user = await db.get().collection(collection.USER_COLLECTION).findOne({mobile:phoneNumber})


            // console.log(user)
            if(user){

              resolve({userFound:true,user})

            }else{

              resolve({userFound:false})
            }
          })
    
    
        },signUpUserVerification:(data)=>{

          // console.log(data.email)

          return new Promise(async(resolve,reject)=>{

                let user = await db.get().collection(collection.USER_COLLECTION).findOne({$or:[{email:data.email},{mobile:data.mobile}]})

                if(user){

                  resolve({userFound:true})

                }
                else{

                  resolve({userFound:false})
                }

          })


        },
        productDetailage:(productvarientId)=>{

          return new Promise(async(resolve,reject)=>{
            
            // console.log(productvarientId);

            let product  = await db.get().collection(collection.PRODUCT_VARIENTS).aggregate([
              {
                $match:{_id: objectId(productvarientId) }
              },
              
              {
                $lookup: {
                from: collection.PRODUCTS,
                localField: "productId" ,
                foreignField: "_id",
                as: "product"
                }
              },
              {
                $project:{product:{$arrayElemAt:['$product',0]},size:1,color:1,mrp:1,quantity:1}
              }
          ]).toArray()

          
          // console.log(product);
          resolve(product)

          })

        },
        relatedProducts:(data)=>{
          
          return new Promise(async(resolve,reject)=>{

            
            // console.log(data[0].product.category)
            // console.log(data[0].product.subcategory)
            let category = data[0].product.category;
            let subcategory = data[0].product.subcategory;

            // console.log(category);
            let relatedProduct = await db.get().collection(collection.PRODUCTS).aggregate([
              {
                $match:{category:category,subcategory:subcategory}
              },
              {
                $lookup:{
                  from:collection.PRODUCT_VARIENTS,
                  localField:'_id',
                  foreignField:'productId',
                  as:'productvarient'
                }
              },
              {
                $project:{
                  productvarient:{$arrayElemAt:['$productvarient',0]},productName:1,brand:1,category:1,subcategory:1,discription:1
                }
              }
            ]).toArray()

            // console.log(relatedProduct)
            resolve(relatedProduct)
          })


        }
        ,
        cart:(productId,userId,subTotal)=>{

          return new Promise (async(resolve,reject)=>{

            let cartProduct = null;
            // console.log(ObjectId(productId),objectId(user));
            // quantity = parseInt(quantity)
            //console.log(quantity)
            


                // cartProduct = {
                // product:objectId(productId),
                // pquantity:quantity
                // }


              
           subTotal = parseInt(subTotal)

                cartProduct = {
                product:objectId(productId),
                quantity:1,
                subTotal:subTotal
                }
                // resolve({})

           

            let user = await db.get().collection(collection.CART).findOne({userId:objectId(userId)});

            //console.log(user)

            
            
            if(user){
              
              let isAvailableCartItem = user.cartItems.findIndex( value => value.product==productId)

              if(isAvailableCartItem != -1){


                resolve({SameProductExist:true})
                
              }else{

                await db.get().collection(collection.CART).updateOne({userId:objectId(userId)},{$push:{cartItems:cartProduct}}).then((response)=>{
                  resolve({newProductUpdated:true})
                })

              }
              
            }else{

              let cartObj = {
                userId:objectId(userId),
                cartItems:[cartProduct],
                
              }
              
              await db.get().collection(collection.CART).insertOne(cartObj).then((response)=>{

                resolve({newProductAdded:true});
              })

            }


          })
        },
        getCartItems:(userId)=>{

          return new Promise(async(resolve,reject)=>{

            let cartItems3 = await db.get().collection(collection.CART).aggregate([
              {
                $match:{userId:objectId(userId)}
              },
              {
                $unwind:'$cartItems'
              },
              {
                $project:{
                  product:'$cartItems.product',
                  quantity:'$cartItems.quantity',
                  subTotal:'$cartItems.subTotal'
                }
              },
              {
                 $lookup:{
                  from:collection.PRODUCT_VARIENTS,
                  localField:'product',
                  foreignField:'_id',
                  as:'productvarient'
                 }
              },
              


              // {
              //   $lookup:{
              //     from:collection.PRODUCTS,
              //     localField:'product',
              //     foreignField:'_id',
              //     as:'productCore'
              //   }
              // }
              {
                $lookup:{

                  from:collection.PRODUCTS,
                  let:{productList:'$productvarient.productId'},
                  pipeline:[
                    {
                      $match:{
                        $expr:{
                          $in:['$_id','$$productList']
                        }
                      }
                    }
                  ],
                  as:'product'

                }
              },
              {
                
                $project:{
                  subTotal:1,quantity:1,productvarient:{$arrayElemAt:['$productvarient',0]},product:{$arrayElemAt:['$product',0]}
                }

              }
              
            ]).toArray()

            // console.log(cartItems3);
            resolve(cartItems3)
          })

        },
        getGrandTotal:(userId)=>{
          
          return new Promise(async(resolve,reject)=>{
            
              let data = await db.get().collection(collection.CART).aggregate([
              {
                $match:{userId:objectId(userId)}
              },
              {
                
                $unwind:"$cartItems",
                
              },
              {
                
                $group:{
                  "_id":objectId(userId),
                  "grandTotal":{$sum:"$cartItems.subTotal"}
                }

              }
            
            ]).toArray()

            // console.log(data)
            resolve(data)

          })

        }
        ,
        deleteCartItem:(product,userId)=>{
          
          return new Promise(async(resolve,reject)=>{

            
            //console.log(product)
            await db.get().collection(collection.CART)
            .updateOne({userId:objectId(userId)},{$pull:{cartItems:{product:objectId(product)}}}).then((result)=>{
              resolve()
            })


          })


        },
        getCartCount:(user)=>{
          
          return new Promise(async(resolve,reject)=>{
            
            console.log(user);

            let count = 0;
            
            let cart =  await db.get().collection(collection.CART).findOne({userId:objectId(user)})

            if(cart){
              count = cart.cartItems.length
            }
            
            resolve(count)

          })

        },
        changeCartQuantity:(details)=>{
          mrp = parseInt(details.mrp)
          // console.log(details.mrp+'asif')
          return new Promise(async(resolve,reject)=>{
            count = parseInt(details.count)
            await db.get().collection(collection.CART)
            .updateOne({_id:objectId(details.cart),'cartItems.product':objectId(details.product)},{
                  
              $inc:{'cartItems.$.quantity':count,'cartItems.$.subTotal':mrp}
              

            }).then((result)=>{

              
              resolve({currentCountUpdated:true})

            })


          })

        },
        addNewAddress:(address,userId)=>{
          
          return new Promise(async(resolve,reject)=>{
            
            // console.log(address)

            let user= await db.get().collection(collection.ADDRESS).findOne({userId:objectId(userId)}) 

            if(user){

              let add = await db.get().collection(collection.ADDRESS).findOne({address:{$elemMatch:{houseNumber:address.houseNumber,
                                                                                                    locality:address.locality,
                                                                                                    district:address.district,
                                                                                                    state:address.state,
                                                                                                    pincode:address.pincode}}})

              console.log(add)

              if(add){
  
                resolve({sameAdressExist:true,msg:'Same Address Already exist'})
  
              }else{
  
                await db.get().collection(collection.ADDRESS).updateOne({userId:objectId(userId)},{ $push:{address:{ addressId:new objectId(),houseNumber:address.houseNumber,
                  locality:address.locality,
                  district:address.district,
                  state:address.state,
                  pincode:address.pincode }}  }).then((result)=>{
    
                  resolve({sameAdressExist:false})
                  
                })
  
              }
            }else{
              
              await db.get().collection(collection.ADDRESS).insertOne({userId:objectId(userId),address:[{addressId:new objectId(),houseNumber:address.houseNumber,
                                                                                                                                  locality:address.locality,
                                                                                                                                  district:address.district,
                                                                                                                                  state:address.state,
                                                                                                                                  pincode:address.pincode}] } ).then((result)=>{
                                                                                                                                
    
                resolve({sameAdressExist:false})
                
              })

            }

            

          })

        },
        getAddress:(userId)=>{

          return new Promise(async(resolve,reject)=>{
            
            let address = await db.get().collection(collection.ADDRESS).findOne({userId:objectId(userId)})

            //console.log(address)
            resolve(address)

          })
          


        },
        getUser:(userId)=>{

          return new Promise(async(resolve,reject)=>{

            let user  = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId) })
              

            // console.log(user)
            resolve(user)

          })
        },
        deleteAddress:(addressId,user)=>{
          
          return new Promise(async(resolve,reject)=>{
            
            await db.get().collection(collection.ADDRESS).updateOne({userId:objectId(user)},{$pull :{address:{addressId:objectId(addressId)}}}).then((result)=>{
  
              resolve()

            })



          })


        },
        editAddress:(userId,addressId)=>{
          
          return new Promise(async(resolve,reject)=>{
            
            //console.log(addressId)

            let address = await db.get().collection(collection.ADDRESS)
            .aggregate([
              {$match: {'address.addressId': objectId(addressId)}},
              {$project: {
                  _id:0,
                  address: {$filter: {

                    input: '$address',
                    as: 'address',
                    cond: {$eq: ['$$address.addressId', objectId(addressId)]}

                  }}
                }
              },
              {
                $project:{
                  address:{$arrayElemAt:['$address',0]}
                }
              }
          
            ]).toArray()

            // console.log(address)

            resolve(address)

          })

        },
        updateAddress:(userId,addressId,address)=>{

          return new Promise(async(resolve,reject)=>{
            
            let add = await db.get().collection(collection.ADDRESS).findOne({address:{$elemMatch:{houseNumber:address.houseNumber,
                                                                                                  locality:address.locality,
                                                                                                  district:address.district,
                                                                                                  state:address.state,
                                                                                                  pincode:address.pincode}}})
              console.log(add);

          if(add){

            resolve({sameAdressExist:true,msg:"Same address already exist"})

          }else{

            await db.get().collection(collection.ADDRESS)
            .updateOne({userId:objectId(userId),"address.addressId":objectId(addressId)},
            {$set:
              {"address.$.houseNumber":address.houseNumber,
                    "address.$.locality":address.locality,
                    "address.$.district":address.district,
                    "address.$.state":address.state, 
                    "address.$.pincode":address.pincode,}})
            .then((result)=>{
  
              resolve({sameAdressExist:false})
  
            })
          }

            

          })


        }

        // verifyCartStatus:(userId)=>{

        //   return new Promise(async(resolve,reject)=>{
            
        //     let findUser = await db.get().collection(collection.PRODUCT_VARIENTS).aggregate([
        //      {
        //        $lookup:{
        //           from:collection.CART,
        //           localField:'_id',
        //           foreignField:'cartItems.product',
        //           as:'cartedProducts'
        //        }
        //      },
        //      {
        //        $unwind:'$cartedProducts'
        //      },
        //      {
        //        $unwind:'$cartedProducts.cartItems'
        //      },
        //      {
        //        $match:{cartedProducts:{userId:userId}}
        //      }
              

        //     //  {

        //     //   $project:{
        //     //     quantity:1,cartedProducts:{$arrayElemAt:['$cartedProducts',0]}
        //     //   }

        //     //  }
               



        //     ]).toArray()

            
        //     // products.map(value => console.log(value))

        //     findUser.map(value => console.log(value))
           

        //     resolve(findUser)

        //   })
          

        // }




          
          
          

    // otpLogInUserVerification:(data)=>{
      
    //   return new Promise(async(resolve,reject)=>{
        

    //     let user = await db.get().collection(collection.USER_COLLECTION).findOne({})



    //   })

    // }

  
  
}