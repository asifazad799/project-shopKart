   
var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcryptjs");
var objectId = require("mongodb").ObjectId;
const { response } = require("express");
const { ObjectId } = require("bson");
const { PRODUCTS } = require("../config/collection");
const Razorpay = require('razorpay');
const { get } = require("http");
const { resolve } = require("path");
var instance = new Razorpay({
    key_id: 'rzp_test_17oewiAfnFqdfq',
    key_secret: 'SzzvQxAz29SV4KHsHz4M2pOH',
});

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
        console.log(userData)
        
        

          
          
       

          if(user){

            if(user.blocked){

              resolve({status:false,msg:"User Blocked"});
            }else{

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
            }
  
          }else{
            console.log('user not found');
            resolve({status:false,msg:"User not found"});
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

    editProfile:(data,userId)=>{

      return new Promise(async(resolve,reject)=>{
        
        await db.get().collection(collection.USER_COLLECTION)
        .updateOne({_id:objectId(userId)},{$set:{email:data.email,first_name:data.first_name,lastname:data.lastname}})
        .then((response)=>{

          resolve()

        })

      })

    },

    otpLogin:(phoneNumber)=>{

      // console.log(phoneNumber)

      return new Promise(async(resolve,reject)=>{
        
          let user = await db.get().collection(collection.USER_COLLECTION).findOne({mobile:phoneNumber})


            //console.log(user)

            if(user){
                if(user.blocked){

                  reject()

                }else{
                  
                  resolve({userFound:true,user})

                }

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
                $project:{product:{$arrayElemAt:['$product',0]},size:1,color:1,mrp:1,quantity:1,oldProPrice:1,oldCatPrice:1}
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


        },
        orders:(payId,orderData,userId)=>{

          return new Promise(async(resolve,reject)=>{

            // await db.get().collection(collection.CART).updateOne({userId:objectId(userId)},{$push:{cartItems:{orderStatus:'placed'}}})
             
            let cartItem = await db.get().collection(collection.CART).aggregate([
              {
                $match:{userId:objectId(userId)}
              },
              {
                $set:{cartItems:{orderStatus:'placed'}}
              },
              {
                $project:{cartItems:1,_id:0}
              }
            ]).toArray()

            console.log(cartItem[0])
            //console.log('asif address')

            if(cartItem[0] != undefined){
              
              let address = await db.get().collection(collection.ADDRESS)
              .aggregate([
                {$match: {'address.addressId': objectId(orderData.address)}},
                {
                  $project: {
                    _id:0,
                    address: {$filter: {
  
                      input: '$address',
                      as: 'address',
                      cond: {$eq: ['$$address.addressId', objectId(orderData.address)]}
  
                    }}
                  }
                },
                {
                  $project:{
                    address:{$arrayElemAt:['$address',0]},_id:0
                  }
                },
                
            
              ]).toArray()
              
              // console.log(address)
              await db.get().collection(collection.ORDERS).insertOne({userId:objectId(userId),
                                                                        finalTotal:orderData.finalTotal,
                                                                        deliveryType:orderData.deliveryType,
                                                                        paymentMethod:orderData.paymentMethod,
                                                                        address:address,
                                                                        paymentId:payId,
                                                                        orderStatus:'Ordered',
                                                                        date:new Date(),
                                                                        cartItems:cartItem[0].cartItems,
                                                                        }).then(async(result)=>{
  
                                                                          await db.get().collection(collection.CART).findOneAndDelete({userId:objectId(userId)})
  
                                                                          
  
                                                                        resolve(result)
                                                                      })

                                                                    }else{
                                                                      
                                                                      reject()
                                                        
                                                                    }
                                                                      


                                         
          })

        },
        dirOrder:(payId,data,userId)=>{
          
          return new Promise(async(resolve,reject)=>{
            
            let address = await db.get().collection(collection.ADDRESS)
            .aggregate([
              {$match: {'address.addressId': objectId(data.address)}},
              {
                $project: {
                  _id:0,
                  address: {$filter: {

                    input: '$address',
                    as: 'address',
                    cond: {$eq: ['$$address.addressId', objectId(data.address)]}

                  }}
                }
              },
              {
                $project:{
                  address:{$arrayElemAt:['$address',0]},_id:0
                }
              },
              
          
            ]).toArray()

            
            let cartItem=[{
              cartItems:[{

                product:objectId(data.productId),
                quantity:parseInt(data.quantity),
                subTotal:parseInt(data.finalTotal),
                orderStatus:"placed",
              }]



            }]
            
            //console.log(cartItem[0])

              await db.get().collection(collection.ORDERS).insertOne({userId:objectId(userId),
                  finalTotal:data.finalTotal,
                  deliveryType:data.deliveryType,
                  paymentMethod:data.paymentMethod,
                  address:address,
                  paymentId:payId,
                  orderStatus:'Ordered',
                  date:new Date(),
                  cartItems:cartItem[0].cartItems,
                  }).then(async(result)=>{
                    

                    resolve()

                  })


          })

        },
        stockUpdate:(orderId)=>{
          
          return new Promise(async(resolve,reject)=>{
            
            let prod = await db.get().collection(collection.ORDERS).aggregate([
              {
                $match:{_id:objectId(orderId)}
              },
              {
                $unwind:'$cartItems'
              },
              {
                $project:{
                  item:"$cartItems.product",
                  quantity:"$cartItems.quantity"
                }
              },
              {
                $lookup:{
                  from:collection.PRODUCT_VARIENTS,
                  localField:'item',
                  foreignField:'_id',
                  as:'products'
                }
              },
              {
                $project:{
                  item:1,quantity:1,product:{$arrayElemAt:['$products',0]},
                  newQuantity:{ $subtract: [{$arrayElemAt:['$products.quantity',0]},'$quantity']}
                }
              }
            ]).toArray()

            let arrLen = prod.length;
            // console.log(prod,arrLen)
            // console.log('asif')
            prod.map(async(value)=>{
              
              if(value.newQuantity>=1){

                await db.get().collection(collection.PRODUCT_VARIENTS)
                .updateOne({_id:objectId(value.item)},{$set:{quantity:value.newQuantity}})

              }else{
                
                await db.get().collection(collection.PRODUCT_VARIENTS).updateOne({_id:objectId(value.item)},{$set:{stockOut:true,quantity:0}})

              }


            })
             resolve()



          })

        },
        getMyOrers:(user)=>{
          
          return new Promise(async(resolve,reject)=>{
            
            let myOrders = await db.get().collection(collection.ORDERS).aggregate([
              {

                  $match:{userId:objectId(user)}

              },
              
              {
                $project:
                   {
                     cartItems:1,
                         address:"$address.address",
                         orderStatus:1,
                         date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        
                   }
              },
              {
                $project:
                   {
                        cartItems:1,
                        address:1,
                        orderStatus:1,
                        date:1,
                        expectedDeliveryDate: { $dateToString: { format: "%Y-%m-%d", date: "$expectedDeliveryDate" } }
                   }
              },
              {
                $unwind:"$cartItems"
              },
              {
                $lookup:{
                  from:collection.PRODUCT_VARIENTS,
                  localField:'cartItems.product',
                  foreignField:'_id',
                  as:'product'
                }
                
              }
              ,
              {
                $unwind:"$product"
              },
              {
                $lookup:{
                  from:collection.PRODUCTS,
                  localField:'product.productId',
                  foreignField:'_id',
                  as:'coreProduct'
                }
              },
              {
                $unwind:"$coreProduct",
              },
              {
                $unwind:"$address",
              },
           
            ]).toArray()

            //console.log(myOrders)

            resolve(myOrders)

          }).catch((response)=>{
            
            console.log(response)

          })

        },
        removeFromOrder:(data)=>{
          
          return new Promise(async(resolve,reject)=>{

            //console.log(data)

            await db.get().collection(collection.ORDERS).updateOne({_id:objectId(data.orderId),"cartItems.product": objectId(data.productId)},{$set:{"cartItems.$.orderStatus":"userCaceled","cartItems.$.quantity":0,"cartItems.$.remove":true}}).then( async(result)=>{
                                  
              if(result){
                
                await db.get().collection(collection.PRODUCT_VARIENTS).updateOne({_id:objectId(data.productId)},{$inc:{quantity:data.quantity}}).then((res)=>{
                  

                  resolve()

                })

              }

            })

          })

        },
        generateRazorPay:(orderId,finalTotal)=>{

          return new Promise(async(resolve,reject)=>{
            
            // orderId = toString(orderId)

            instance.orders.create({
              amount: finalTotal*100,
              currency: "INR",
              receipt: ""+orderId 
            },(err,order)=>{
              // console.log("New Order :",order);
              resolve(order)
            });
            
            

          })

        },
        verifyPayment:(details)=>{

          return new Promise(async (resolve,reject)=>{

            const crypto = require('crypto');
            
            let hmac = crypto.createHmac('sha256', 'SzzvQxAz29SV4KHsHz4M2pOH');
            
            hmac.update(details['response[razorpay_order_id]']+'|'+details['response[razorpay_payment_id]']);
            hmac=hmac.digest('hex');
            if(hmac==details['response[razorpay_signature]']){
              resolve()
            }else{
              reject()
            }


          })

        },
        generateRazorPayDir:(orderId,finalTotal)=>{

          return new Promise(async(resolve,reject)=>{
            
            //orderId = toString(orderId)

            instance.orders.create({
              amount: finalTotal*100,
              currency: "INR",
              receipt: ""+orderId 
            },(err,order)=>{
              //console.log("New Order :",order);
              resolve(order)
            });
            
            

          })

        },
        addToWishlist:(productId,userId)=>{
          
          return new Promise(async(resolve,reject)=>{
            
            // console.log(productId)
            let userExist = await db.get().collection(collection.WISHLIST).findOne({userId:objectId(userId)})
            
            if(userExist){ 

              let isProductAvailable = userExist.products.findIndex(value => value.productId==productId)
              
              //console.log(isProductAvailable)

              if(isProductAvailable != -1){
                
                reject({proExist:true})

              }else{
                
                await db.get().collection(collection.WISHLIST)
                .updateOne({userId:objectId(userId)},{$push:{products:{productId:objectId(productId)}}})
                .then((result)=>{
                  
                  resolve({adde:true})

                })

              }
            }else{
              
              
              await db.get().collection(collection.WISHLIST)
              .insertOne({userId:objectId(userId),products:[{productId:objectId(productId)}]})
              .then((result)=>{
                
                resolve()
  
              })

            }

          })

        },
        getWishlistItems:(userId)=>{
          
          return new Promise(async(resolve,reject)=>{
            
            let wishlistItems = await db.get().collection(collection.WISHLIST)
                                .findOne({userId:objectId(userId)})
            if(wishlistItems){
              
              let products = await db.get().collection(collection.WISHLIST)
              .aggregate([

                {
                  $match:{userId:objectId(userId)}
                },
                {
                  $unwind:"$products"
                },
                {
                  $project:{products:"$products.productId",userId:1}
                },
                {
                  $lookup:{
                    from:collection.PRODUCT_VARIENTS,
                    localField:'products',
                    foreignField:'_id',
                    as:'productVarient'
                  }
                },
                {
                  $unwind:"$productVarient"
                },
                {
                  $lookup:{
                    from:collection.PRODUCTS,
                    localField:'productVarient.productId',
                    foreignField:'_id',
                    as:'coreProducts'
                  }
                },
                {
                  $unwind:"$coreProducts"
                }
              ]).toArray()
              //console.log(products)

              resolve(products)

            }else{
              
              reject()

            }


          })

        },
        removeFromWishlist:(productId,userId)=>{
          
          return new Promise(async(resolve,reject)=>{

            await db.get().collection(collection.WISHLIST)
            .updateOne({userId:objectId(userId)},{$pull:{products:{productId:objectId(productId)}}})
            .then((result)=>{
              
              resolve()

            })
            
          })

        },
        getWishlistCount:(userId)=>{
          
          return new Promise(async(resolve,reject)=>{

            let wishlist = await db.get().collection(collection.WISHLIST).findOne({userId:objectId(userId)})

            if(wishlist){
              
              let count = wishlist.products.length
              //console.log(count)
              resolve(count)

            }else{
              
              reject()

            }

            

          })

        },
        catWiseProdutcPicker:(category)=>{
          
          return new Promise(async(resolve,reject)=>{
            
            let products = await db.get().collection(collection.PRODUCTS)
                          .aggregate([
                            {
                              $match:{category:category}
                            },
                            {
                              $lookup:{
                                from:collection.PRODUCT_VARIENTS,
                                localField:'_id',
                                foreignField:'productId',
                                as:'productVarient'
                              }
                            },
                            {
                              $project:{
                                productVarient:{$arrayElemAt:["$productVarient",0]}
                                ,productName:1
                                ,brand:1
                                ,category:1
                                ,subcategory:1
                                ,discription:1
                                
                              }
                            },
                            
                            
                          ]).toArray()
            //console.log(products)
            let categoryData = await db.get().collection(collection.CATEGORY).findOne({category:category})
            // await products.forEach((val)=>{

            //   if(!categoryData.includes(val.subcategory)){

            //     categoryData.push(val.subcategory)

            //   }
              
            // })
            categoryData = categoryData.subcategory
             //console.log(products)
            if(products == ""){

              console.log('pro')
              reject({noData:true})

            }else{

              console.log('no')
              resolve({products,categoryData})

            }

          })

        },
        catWiswSubCatWiseProductPicker:(category,subCategory)=>{
          
          return new Promise(async(resolve,reject)=>{
            
            // console.log(category,subCategory)
            let products = await db.get().collection(collection.PRODUCTS)
            .aggregate([
              {
                $match:{category:category,subcategory:subCategory}
              },
              {
                $lookup:{
                  from:collection.PRODUCT_VARIENTS,
                  localField:'_id',
                  foreignField:'productId',
                  as:'productVarient'
                }
              },
              {
                $project:{
                  productVarient:{$arrayElemAt:["$productVarient",0]}
                  ,productName:1
                  ,brand:1
                  ,category:1
                  ,subcategory:1
                  ,discription:1
                  
                }
              },
              
              
            ]).toArray()
            //console.log(products)
            let categoryData = await db.get().collection(collection.CATEGORY).findOne({category:category})
            categoryData = categoryData.subcategory
            if(products!=""){
              
              resolve({products,categoryData})

            }else{
              
              resolve({noData:true,categoryData})
              
            }


          })

        },
        getProduct:(productId)=>{

          return new Promise(async(resolve,reject)=>{
            
            let product = await db.get().collection(collection.PRODUCT_VARIENTS)
            .aggregate([
              {

                $match:{_id:objectId(productId)}

              },
              {
                $lookup:{
                  from:collection.PRODUCTS,
                  localField:'productId',
                  foreignField:'_id',
                  as:'product'
                }
              },
              {
                $unwind:"$product"
              }
              
            ]).toArray()

            //console.log(product)
            resolve(product)

          })

        },
        updateCouponUsage:(userId,cpCode)=>{
          
          return new Promise(async(resolve,reject)=>{
            
            await db.get().collection(collection.COUPONS)
            .updateOne({couponCode:cpCode},{$push:{usedBy:userId}}).then((result)=>{
              
              resolve()

            })

          })

        }

}