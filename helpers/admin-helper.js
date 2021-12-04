var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectId;
const { response } = require("express");
const { PRODUCT_VARIENTS, PRODUCTS } = require("../config/collection");

module.exports = {

    getOrderCount:()=>{
        
        return new Promise(async(resolve,reject)=>{
            
            let orderCount = await db.get().collection(collection.ORDERS).aggregate([

                {
                    $unwind:'$cartItems'
                },
                {
                    $project:{

                        total:{ $sum:"$cartItems.quantity"},
                        revenue:"$cartItems.subTotal",

                    }
                },
                
            ]).toArray()
            
            //console.log(orderCount)
                
            let quantity = 0 
            let reveneu = 0

            await orderCount.map((element)=>{

                quantity = element.total+quantity
                reveneu = element.revenue+reveneu
            })
            
            
            //console.log(quantity)
            // console.log(orderCount)
            resolve({quantity,reveneu})

        })

    },
    totalProfit:()=>{

        return new Promise(async(resolve,reject)=>{

            let totalRevenue = await db.get().collection(collection.ORDERS).aggregate([

                {
                    $unwind:'$cartItems'
                },
                {
                    $project:{quantity:"$cartItems.quantity",
                                productId:"$cartItems.product",
                                subTotal:"$cartItems.subTotal"
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_VARIENTS,
                        localField:'productId',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $unwind:"$product"
                },
                {
                    $project:{
                        
                        landingcost:"$product.landingcost",
                        quantity:1,
                        subTotal:1
                    }
                }
            ]).toArray()

            console.log(totalRevenue)
            
            let totalCost = 0;
            let totalGet = 0
            await totalRevenue.map((element)=>{
                
                if(element.quantity!=0){
                     
                    totalCost= element.quantity*element.landingcost+totalCost
                    totalGet = element.subTotal+totalGet

                }
                
            })
            
            let totalProfit = totalGet - totalCost;
            
            //console.log(totalCost,totalGet,totalProfit)

            resolve(totalProfit)
        })

    },
    getOrderMethodsCount:()=>{
        
        return new Promise(async(resolve,reject)=>{
            
            let data = await db.get().collection(collection.ORDERS).aggregate([
                
                {
                    $group:{
                            _id:"$paymentMethod",
                            count:{$sum:1}
                    }
                },
                {
                    $sort:{_id:1}
                }

            ]).toArray()

            //console.log(data)
            resolve(data)
        })

    },
    getPerDaySalesData:()=>{

        return new Promise(async(resolve,reject)=>{
            
            let data = await db.get().collection(collection.ORDERS).aggregate([
                
                {
                    $project:{
                        date:{$dateToString: { format: "%Y-%m-%d", date: "$date" } },cartItems:1
                    }
                },
                {
                    $unwind:"$cartItems"
                },
                {
                    $group:{
                        _id:"$date",
                        count:{$sum:"$cartItems.quantity"}
                    }
                },
                {
                    $sort:{_id:-1}
                },
                {
                    $limit:7
                }
                
            ]).toArray()

            //console.log(data)
            resolve(data)
        })

    },
    topSellingProductInPercentage:()=>{

        return new Promise(async(resolve,reject)=>{
            
            let percentage = await db.get().collection(collection.ORDERS).aggregate([
                
                {
                    $unwind:"$cartItems"
                },
                {
                    $group:{
                        _id:"$cartItems.product",
                        count:{$sum:"$cartItems.quantity"}
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_VARIENTS,
                        localField:'_id',
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
                        as:'coreProduct'
                    }
                },
                {
                    $unwind:"$coreProduct"
                },
                {
                    $group:{
                        _id:null,
                        totalSale:{$sum:"$count"},
                        products:{$push:{productVarient:"$productVarient",coreProduct:"$coreProduct",count:"$count"}}
                    }
                },
                {
                    $unwind:"$products"
                },
                {
                    $project:{
                        count:'$products.count',
                        productVarient:'$products.productVarient',
                        coreProduct:'$products.coreProduct',
                        //totalSale:"$totalSale",
                        "percentage":{$multiply:[{$divide:["$products.count","$totalSale"]},100]}
                    }
                },
                {
                    $match:{"percentage":{"$gte":20}}
                },
                
                {
                    $project:{count:1,productVarient:1,coreProduct:1,
                    
                        percentage:{ $trunc: [ "$percentage", 0 ] }
                       
                    }
                },
                {
                    $sort:{percentage:-1}
                }
               
            ]).toArray()

            console.log(percentage)
            resolve(percentage)

        })

    },
    topSellingProducts:()=>{
        
        return new Promise(async(resolve,reject)=>{
            
            let topSellingProducts = await db.get().collection(collection.ORDERS).aggregate([
                {
                    $unwind:"$cartItems"
                },
                {
                    $group:{
                        _id:"$cartItems.product",
                        count:{$sum:"$cartItems.quantity"}
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_VARIENTS,
                        localField:'_id',
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
                        as:'coreProduct'
                    }
                },
                {
                    $unwind:"$coreProduct"
                },
                {
                    $sort:{count:-1}
                },
                {
                    $limit:5
                }
            ]).toArray()

            //console.log(topSellingProducts)
            resolve(topSellingProducts)
        })

    },
    currentDaySale:()=>{
        
        return new Promise(async(resolve,reject)=>{
            
            let yourDate = new Date()
            yourDate=yourDate.toISOString().split('T')[0]

            let todaySale = await db.get().collection(collection.ORDERS).aggregate([
                
                {
                    $project:{
                        date:{$dateToString: { format: "%Y-%m-%d", date: "$date" } },cartItems:1
                    }
                },
                {
                    $unwind:"$cartItems"
                },
                {
                    $match:{date:yourDate}
                },
                {
                    $group:{
                        _id:"$date",
                        total:{$sum:"$cartItems.subTotal"}
                    }
                }

            ]).toArray()
            
            let data = 0;
            todaySale.map(val=> data=val.total)
            //console.log(data)

            resolve(data)

        })

    },
    getBestSellingCat:()=>{

        return new Promise(async(resolve,reject)=>{

            let  currentDate = new Date()
            let bestCat = await db.get().collection(collection.ORDERS).aggregate([

               
                
                {
                    $unwind:"$cartItems"
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_VARIENTS,
                        localField:'cartItems.product',
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
                        as:'coreProduct'
                    }
                },
                {
                    $unwind:"$coreProduct"
                },
                {
                    $project:{

                        PreviousDate: { $subtract: [  currentDate , (1000*60*60*24*7) ] },date:1,
                        category:"$coreProduct.category"
                    
                    }
                },
                {
                    $group: {
                      _id: {
                        category : "$category" },
                        FDate: { $first : currentDate },
                        LDate: { $first : "$PreviousDate" },
                        count: { $sum: 1 }       
                    }
                },
                {
                    $sort:{"_id.category":1}
                }

            ]).toArray()

            //console.log(currentDate)
            //console.log(bestCat)
            resolve(bestCat)

        })

    },
    getAllUsers:()=>{

        return new Promise(async(resolve,reject)=>{
            
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()

            resolve(users)

        })

    },
    blockUser:(user1)=>{

        return new Promise(async(resolve,reject)=>{
            
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(user1)})

            console.log(user.blocked)

            if(user.blocked){

                // console.log('blocked')
                await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(user1)},{$set:{blocked:false}})
                
            }else{

                // console.log('not blocked')
                await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(user1)},{$set:{blocked:true}})

            }


        })


    },
    getAllBlockedUser:()=>{

        return new Promise(async(resolve,reject)=>{
            
            let blockedUsers = await db.get().collection(collection.USER_COLLECTION).find({blocked:true}).toArray()

            resolve(blockedUsers)

        })

    },

    getCategoryTable:()=>{


        return new Promise (async(resolve,reject)=>{

            await db.get().collection(collection.CATEGORY).find().toArray((err,data)=>{

                 resolve(data);
            });

            // resolve({catTable})
            

        })


    },

    deleteSubCat:(data)=>{

        return new Promise (async (resolve,reject)=>{

            await db.get().collection(collection.CATEGORY)
            .updateOne({category:data.category},{$pull:{subcategory:data.subcategory}}).then((data)=>{
                resolve();
            })

        })



    },
    deleteCat:(data)=>{

        console.log(data)

        return new Promise (async (resolve,reject)=>{

            await db.get().collection(collection.CATEGORY)
            .remove({category:data.category}).then((data)=>{

                resolve();
                
            });
            

        })



    },


    addCategory:(categoryData)=>{

        return new Promise(async(resolve,reject)=>{

            let isCategoryAvailable = await db.get().collection(collection.CATEGORY)
                                                    .findOne({category:categoryData.category});

            if(isCategoryAvailable){
                let currentSubCategory = isCategoryAvailable.subcategory;
                
                //console.log(currentSubCategory);

                
                var isAvailable = currentSubCategory.includes(categoryData.subcategory) //checking existing


                if(isAvailable){

                    console.log('sub already exist');
                    resolve({subExist:true,msg:"This sub category already exist for this category"})

                }else {

                        db.get().collection(collection.CATEGORY)
                        .updateOne({category:categoryData.category},{$push:{subcategory:categoryData.subcategory}});
                        console.log('sub added');
                        resolve({subExist:false,msg:"Subcategory Added"})

                }

            }else{

                await db.get().collection(collection.CATEGORY)
                    .insertOne({category:categoryData.category,subcategory:[categoryData.subcategory]});
                console.log('new scb and cat added')

                resolve({newCategory:true,msg:"new category Added"})

            }
        })

    },getBrand:()=>{

        return new Promise (async(resolve,reject)=>{

            
             await db.get().collection(collection.BRAND).find().toArray((err,data)=>{
                // console.log(data)
                resolve(data);
            });

            

        })


    },
    deleteBrand:(data)=>{

        return new Promise(async(resolve,reject)=>{


            await db.get().collection(collection.BRAND).deleteOne({_id:objectId(data.brandId) }).then((result)=>{


                resolve(result)
            })

        })

    },

    // addNewBrand:(brand,callback)=>{
        
    //     console.log(brand)

    //     db.get().collection(collection.BRAND).insertOne(brand).then((data)=>{

    //         console.log(data)
    //         callback(data)

    //     })


    // }
    
    addNewBrand:(data)=>{

        return new Promise (async(resolve,reject)=>{

            let currentBrand = await db.get().collection(collection.BRAND).findOne({brandName:data.brandName})

            if(currentBrand){

                if(currentBrand.brandName == data.brandName){

                    resolve({brand:true,msg:"This brand already exist"})

                }
                
            }else{

                // console.log('add here')

                db.get().collection(collection.BRAND).insertOne({brandName:data.brandName,brandSymbol:data.brandSymbol}).then((data)=>{


                    // console.log(data)
                    resolve({brand:false,data,msg:"brand added"})

                })

            }
                
        })
        
    },
    getSubCategoryTable:(data)=>{

        return new Promise(async(resolve,reject)=>{


           let category= await db.get().collection(collection.CATEGORY).findOne({category:data.category});

           if(category){

            resolve(category.subcategory);
           }

        })
    },
    addNewProduct:(data)=>{

        return new Promise(async(resolve,reject)=>{
            
            data.landingcost = parseInt(data.landingcost)
            data.mrp = parseInt(data.mrp)
            data.quantity = parseInt(data.quantity)
            let isProductAvailable = await db.get().collection(collection.PRODUCTS).findOne({productName:data.productName});

            if(isProductAvailable){

                resolve({alreadyAvailable:true,msg:'product already present'})

            }else{

                await db.get().collection(collection.PRODUCTS).insertOne({productName:data.productName,
                                                                            brand:data.brand,
                                                                            category:data.category,
                                                                            subcategory:data.subcategory,
                                                                            discription:data.discription}).then((result)=>{


                    
                //  console.log(result.insertedId);
                if(result){
                    
                    db.get().collection(collection.PRODUCT_VARIENTS).insertOne({productId:result.insertedId,
                                                                                    size:data.sizes,
                                                                                    color:data.color,
                                                                                    landingcost:data.landingcost,
                                                                                    mrp:data.mrp,
                                                                                    quantity:data.quantity}).then((varientResult)=>{

                        

                        let varId = varientResult.insertedId;

                        console.log(varId);

                        resolve({alreadyAvailable:false,msg:'prouct added',varId})

                    })
                    

                }
    
                   
                })

            }


        })

    },


    AddNewVarient:(product,data)=>{
        
        return new Promise (async(resolve,reject)=>{


            // console.log(varient);
            await db.get().collection(collection.PRODUCT_VARIENTS).insertOne({productId:objectId(product),
                                                                                        size:data.sizes,
                                                                                        color:data.color,
                                                                                        landingcost:data.landingcost,
                                                                                        mrp:data.mrp,
                                                                                        quantity:data.quantity}).then((result)=>{

                                                                                            console.log(result);

                                                                                        })
            




        })


    }
    ,
    viewAllProducts:()=>{

        return new Promise(async(resolve,reject)=>{

            

            let cc = await db.get().collection(collection.PRODUCTS).
            aggregate([
            
            {
                $lookup: {
                from: collection.PRODUCT_VARIENTS,
                localField: "_id" ,
                foreignField: "productId",
                as: "productVarients"
                }
            },
            

            ]).toArray()

            //console.log(cc)
                                                                        
            resolve(cc)
        
        })
    },
    getVarients:(productId)=>{

        return new Promise(async(resolve,reject)=>{
            
            //console.log(productId+'asif')

            let varients = await db.get().collection(collection.PRODUCTS).aggregate([
                
                {
                    $match:{_id:objectId(productId)}
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_VARIENTS,
                        localField:'_id',
                        foreignField:'productId',
                        as:'varients'
                    }
                },
                {
                    $unwind:"$varients"
                }

            ]).toArray()

            //console.log(varients)
            resolve(varients)

        })

    },
    varientEdit:(data)=>{
        

        return new Promise(async(resolve,reject)=>{

            // console.log(objectId(data.varientId));

            let varient = await db.get().collection(collection.PRODUCT_VARIENTS).findOne({_id:objectId(data.varientId)})

            // console.log(varient);

            resolve(varient);

        })

    },varientUpdate:(varientId,data)=>{

        return new Promise (async(resolve,reject)=>{

            let quantity=parseInt(data.quantity) 
            let mrp = parseInt(data.mrp)
            let landingcost = parseInt(data.landingcost)
            // console.log(varientId.varientId);

            await db.get().collection(collection.PRODUCT_VARIENTS).updateOne({_id:objectId(varientId.varientId)},{$set:{size:data.size,
                                                                                                color:data.color,
                                                                                                landingcost:landingcost,
                                                                                                mrp:mrp,
                                                                                                quantity:quantity,
                                                                                                stockOut:false}}).then((result)=>{

                
                
                resolve()

            })
            
            // console.log(b)

        })


    },
        




    deleteProduct:(data)=>{


        return new Promise(async(resolve,reject)=>{



            await  db.get().collection(collection.PRODUCTS).deleteOne({_id:objectId(data.id)}).then((result)=>{


                // console.log(result)

                if(result){

                    db.get().collection(collection.PRODUCT_VARIENTS).deleteOne({productId:objectId(data.id)}).then((result)=>{

                        // let ih = data.varientId

                        // ih.map( (value) =>  {console.log(value)})

                        resolve({result,msg:"product deleted",found:true})


                    })


                }else{

                    response({found:false})
                }

            })
            
        })

    },
    editProducts:(data)=>{


        return new Promise(async(resolve,reject)=>{


            let b = await db.get().collection(collection.PRODUCTS).findOne({_id:objectId(data.productId)})

            // console.log(b)
            resolve({b})
            
        })
        
        
    },
    upadateProduct:(data,productId)=>{


        return new Promise(async(resolve,reject)=>{


            // console.log(objectId(productId))

            await db.get().collection(collection.PRODUCTS).updateOne({_id:objectId(productId)},{$set:{productName:data.productName,brand:data.brand,category:data.category,subcategory:data.subcategory,discription:data.discription}}).then((result)=>{
                
                resolve()


            })




        })


    },
    getAllOrders:()=>{
        
        return new Promise(async(resolve,reject)=>{

            let data  = await db.get().collection(collection.ORDERS).aggregate([
                {
                    $lookup:{
                        from:collection.USER_COLLECTION,
                        localField:'userId',
                        foreignField:'_id',
                        as:'user'
                    }
                },
                {
                    $unwind:'$user'
                },
                {
                    $unwind:'$address' 
                }
                    
            ]).toArray()

            console.log(data)

            resolve(data)

        })

    },
    updateOrderStatus:(order)=>{
        
        

        return new Promise(async(resolve,reject)=>{
            // console.log(order)

            let quantity=parseInt(order.quantity)

            let currentStatus = await db.get().collection(collection.ORDERS).aggregate([
            {
                $match:{_id:objectId(order.orderId),"cartItems.product": objectId(order.productId)}
            },
            {
                $unwind:"$cartItems"
            },
            {
                $match:{"cartItems.product": objectId(order.productId)}
            },
            {
                $project:{cartItems:1,_id:0}
            }
            ]).toArray()

            
            let status = currentStatus[0].cartItems.orderStatus
            //console.log(status)
            
            if(status=="Delivered"){

                resolve({delivered:true})

            }else if(status=="Canceled"){

                resolve({canceld:true})

            }else if(status=="userCaceled"){

                resolve({usercanceld:true})

            }
            else{

                if(order.orderStatus=='Canceled'){
                        
                    await db.get().collection(collection.ORDERS).updateOne({_id:objectId(order.orderId),"cartItems.product": objectId(order.productId)},{$set:{"cartItems.$.orderStatus":order.orderStatus,"cartItems.$.quantity":0,"cartItems.$.remove":true}}).then( async(result)=>{
                                  
                        if(result){
                          
                          await db.get().collection(collection.PRODUCT_VARIENTS).updateOne({_id:objectId(order.productId)},{$inc:{quantity:quantity}}).then((res)=>{
                            
                            resolve({delivered:false})
          
                          })
          
                        }
          
                      })
                }else if(order.orderStatus=='Delivered'){

                    await db.get().collection(collection.ORDERS).updateOne({_id:objectId(order.orderId),"cartItems.product": objectId(order.productId)},{$set:{"cartItems.$.orderStatus":order.orderStatus,"cartItems.$.quantity":0,"cartItems.$.delivered":true}}).then( async(result)=>{

                        resolve()

                    })

                }
                else{
                    await db.get().collection(collection.ORDERS).updateOne({_id:objectId(order.orderId),"cartItems.product": objectId(order.productId) },{$set:{"cartItems.$.orderStatus":order.orderStatus}}).then((result)=>{
    
                        resolve({delivered:false})
    
                    })

                }

            }
        })

    },
    getOrderedProduct:(orderId)=>{
        
        return new Promise(async(resolve,reject)=>{

            //console.log(orderId.orderId)
            let data = await db.get().collection(collection.ORDERS).aggregate([
                {
                    $match:{_id:objectId(orderId.orderId)}
                },
                {
                    $unwind:"$cartItems"
                },
                {
                    $project:{cartItems:1}
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_VARIENTS,
                        localField:'cartItems.product',
                        foreignField:'_id',
                        as:'products'
                    }
                },
                {
                    $unwind:"$products"
                },
                {
                    $lookup:{

                        from:collection.PRODUCTS,
                        localField:'products.productId',
                        foreignField:'_id',
                        as:'productCore'
                        
                    }
                },
                {
                    $unwind:"$productCore"
                }
            ]).toArray()

            console.log(data)

            resolve(data)

        })

    },
    addNewCatOffer:(data)=>{
        
        return new Promise(async(resolve,reject)=>{
            
            let offerExist = await db.get().collection(collection.CATOFFERS).findOne(
                            {category:data.category}) 

            if(offerExist){

                resolve({sameExist:true})
                
            }else{

                //console.log(offerExist)
               

                            let offer = parseInt(data.offer)
                            //console.log(offerId)

                            let items = await db.get().collection(collection.PRODUCTS).aggregate([
                                {
                                    $match:{category:data.category}
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
                                    $unwind:"$productvarient"
                                }
                                
                            
                            ]).toArray()

                            //console.log(items)
                            
                            
                            await items.map(async(product)=>{
                                
                                
                                offer = parseInt(data.offer)
                                
                                

                                //console.log('mrp:'+mrp+"off:"+off+"offerPrice:"+offerPrice)
                                if(product.productvarient.oldProPrice){
                                    
                                   

                                    let mrp = parseInt(product.productvarient.oldProPrice)
                                
                                    let off = (mrp/100)*offer;
                                        
                                    let offerPrice = mrp-off;
                                    
                                    offerPrice = offerPrice.toFixed(2)

                                    offerPrice = parseInt(offerPrice)
                                    
                                    if(offerPrice<product.productvarient.mrp){
                                        
                                        await db.get().collection(collection.PRODUCT_VARIENTS).updateOne({_id:product.productvarient._id},
                                                                                                        {$set:{mrp:offerPrice,oldCatPrice:mrp},
                                                                                                          $unset:{oldProPrice:""}})

                                    }else{
                                        
                                        Console.log('better in Pro Offer')
                                        //continue;

                                    }

                                }else{

                                  
                                    console.log('adding')
                                    offer = parseInt(data.offer)
                                    let mrp = parseInt(product.productvarient.mrp)
                                
                                    let off = (mrp/100)*offer;
                                        
                                    let offerPrice = mrp-off;
                                    
                                    offerPrice = offerPrice.toFixed(2)

                                    offerPrice = parseInt(offerPrice)

                                    await db.get().collection(collection.PRODUCT_VARIENTS).updateOne({_id:product.productvarient._id},
                                                                                                    {$set:{mrp:offerPrice,oldCatPrice:mrp}})

                                }

                            })
                            
                            
                            await db.get().collection(collection.CATOFFERS).insertOne(
                                {category:data.category,
                                    offer:offer,
                                    startingDate:data.startingDate,
                                    expairyDate:data.startingDate}).then(async(result)=>{
                                    
                                        resolve({sameExist:false})
                                    
                                    })
                               



                        

            }
        })

    },
    getCatOffers:()=>{

        return new Promise(async(resolve,reject)=>{
            
            let catOfferData = await db.get().collection(collection.CATOFFERS).find().toArray()

            //console.log(catOfferData)

            resolve(catOfferData)

        })
    },
    editCatOffer:(category)=>{
        
        return new Promise(async(resolve,reject)=>{
            
            let data = await db.get().collection(collection.CATOFFERS)
                        .findOne({category:category})

                        if(data){
                            
                            resolve(data)
                        }else{
                            
                            reject()

                        }

        })

    },
    updateCatOffer:(catOfferId,category,data)=>{
        
        return new Promise(async(resolve,reject)=>{
            
            // console.log(catOfferId,data)
            let offer = parseInt(data.offer)
            await db.get().collection(collection.CATOFFERS).updateOne({_id:objectId(catOfferId)},
                    {
                        $set:{
                            
                            
                            offer:offer,
                            startingDate:data.startingDate,
                            expairyDate:data.startingDate

                        }
                    })
                    .then(async(result)=>{

                       
                        //console.log(offerId)

                        let items = await db.get().collection(collection.PRODUCTS).aggregate([
                            {
                                $match:{category:category}
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
                                $unwind:"$productvarient"
                            }
                            
                        
                        ]).toArray()

                       
                        
                        await items.map(async(product)=>{
                           


                                if(product.productvarient.oldProPrice){
                                    
                                    let mrp = parseInt(product.productvarient.oldProPrice)
                                    
                                    let off = (mrp/100)*offer;
                                        
                                    let offerPrice = mrp-off;
                                    
                                    offerPrice = offerPrice.toFixed(2)
    
                                    offerPrice = parseInt(offerPrice)
                                    
                                    if(offerPrice<product.productvarient.mrp){
                                        
                                        await db.get().collection(collection.PRODUCT_VARIENTS).updateOne({_id:product.productvarient._id},
                                                                                                        {$set:{mrp:offerPrice,oldCatPrice:mrp},
                                                                                                          $unset:{oldProPrice:""}})
    
                                    }else{
                                        
                                        console.log('better in Pro Offer')
                                        //continue;
    
                                    }
    
    
                                }
                                else{

                                    let proOffer = await db.get().collection(collection.PRODUCT_OFFERS).findOne({productName:product.productName})

                                    if(proOffer){

                                        console.log(proOffer.offer,offer)
                                        if(proOffer.offer>offer){
                                            
                                            //console.log('asif')
                                            let mrp = parseInt(product.productvarient.oldCatPrice)
                                    
                                            let off=(mrp/100)*proOffer.offer;
                                                
                                            let offerPrice = mrp-off
                                            
                                            offerPrice = offerPrice.toFixed(2)
                
                                            offerPrice = parseInt(offerPrice)
                    
                                            //console.log('mrp:'+mrp+"off:"+off+"offerPrice:"+offerPrice)
                                            
                                            await db.get().collection(collection.PRODUCT_VARIENTS).updateOne({_id:product.productvarient._id},
                                                                                                                {$set:{mrp:offerPrice,oldProPrice:mrp},
                                                                                                                 $unset:{oldCatPrice:""}})  

                                        }else{
                                            
                                            //console.log('not asif')
                                            let mrp = parseInt(product.productvarient.oldCatPrice)
                                    
                                            let off=(mrp/100)*offer;
                                                
                                            let offerPrice = mrp-off
                                            
                                            offerPrice = offerPrice.toFixed(2)
                
                                            offerPrice = parseInt(offerPrice)
                    
                                            //console.log('mrp:'+mrp+"off:"+off+"offerPrice:"+offerPrice)
                                            
                                            await db.get().collection(collection.PRODUCT_VARIENTS).updateOne({_id:product.productvarient._id},
                                                                                                                {$set:{mrp:offerPrice}})

                                        }
                                        
                                    }else{

                                        
                                        //console.log('hai asif')
                                        let mrp = parseInt(product.productvarient.oldCatPrice)
                                    
                                        let off=(mrp/100)*offer;
                                            
                                        let offerPrice = mrp-off
                                        
                                        offerPrice = offerPrice.toFixed(2)
            
                                        offerPrice = parseInt(offerPrice)
                
                                        //console.log('mrp:'+mrp+"off:"+off+"offerPrice:"+offerPrice)
                                        
                                        await db.get().collection(collection.PRODUCT_VARIENTS).updateOne({_id:product.productvarient._id},
                                                                                                            {$set:{mrp:offerPrice}})

                                    }
                          
                                    
                                    
    
                                }
                        })

                        resolve()
                    })
        
        })

    },
    deleteCatOffer:(category)=>{
        
        return new Promise(async(resolve,reject)=>{
            
            await db.get().collection(collection.CATOFFERS).deleteOne({category:category}).then(async(result)=>{
                
                let items = await db.get().collection(collection.PRODUCTS).aggregate([
                    {
                        $match:{category:category}
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
                        $unwind:"$productvarient"
                    }
                    
                
                ]).toArray()

                //console.log(items)

                await items.map(async(product)=>{
                    

                    if(product.productvarient.oldCatPrice){

                        let proOfferCheck = await db.get().collection(collection.PRODUCT_OFFERS).findOne({productName:product.productName})

                        if(proOfferCheck){

                            console.log(proOfferCheck)

                            let offer = parseInt(proOfferCheck.offer)
                        
                            let off = (product.productvarient.oldCatPrice/100)*offer

                            let offerPrice= product.productvarient.oldCatPrice-off

                            offerPrice = offerPrice.toFixed(2)

                            offerPrice = parseInt(offerPrice)
                            await db.get().collection(collection.PRODUCT_VARIENTS).updateOne({_id:objectId(product.productvarient._id)},
                                                                                                    {$set:{mrp:offerPrice,oldProPrice:product.productvarient.oldCatPrice},
                                                                                                        $unset:{
                                                                                                            oldCatPrice:""
                                                                                                        }})
                        
                        }else{

                            //console.log(product)
    
                            let mrp = parseInt(product.productvarient.oldCatPrice)
                            await db.get().collection(collection.PRODUCT_VARIENTS).updateOne({_id:objectId( product.productvarient._id)},
                                                                                                {
                                                                                                    $unset:{
                                                                                                        oldCatPrice:""
                                                                                                    },
                                                                                                    $set:{
                                                                                                        mrp:mrp
                                                                                                    }
                                                                                                })

                        }
                    }else{
                        
                        console.log('not cat offer')

                    }

                })

                resolve()
                

            })

        })

    },
    addNewProductOffer:(data)=>{
        
        return new Promise(async(resolve,reject)=>{
            
            let isProductAvailable = await db.get().collection(collection.PRODUCT_OFFERS).findOne({productName:data.product})

            if(isProductAvailable){
                
                reject({isAvailable:true})

            }else{
                
                //console.log(data)
                
                
                let productId = await db.get().collection(collection.PRODUCTS).findOne({productName:data.product})
                let proDetails = await db.get().collection(collection.PRODUCT_VARIENTS).findOne({productId:productId._id})
                console.log(proDetails)
                
                
                
                //console.log(off)
                
                if(proDetails.oldCatPrice){
                        let offer = parseInt(data.offer)
                    
                        let off = (proDetails.oldCatPrice/100)*offer

                        let offerPrice= proDetails.oldCatPrice-off

                        offerPrice = offerPrice.toFixed(2)

                        offerPrice = parseInt(offerPrice)

                        if(offerPrice<proDetails.mrp){

                            await db.get().collection(collection.PRODUCT_OFFERS).insertOne({productName:data.product,
                                                                                            offer:offer,
                                                                                            startingDate:data.startingDate,
                                                                                            expairyDate:data.expairyDate}).then(async(result)=>{

                                await db.get().collection(collection.PRODUCT_VARIENTS).updateOne({_id:objectId(proDetails._id)},
                                                                                                    {$set:{mrp:offerPrice,oldProPrice:proDetails.oldCatPrice},
                                                                                                        $unset:{oldCatPrice:" "}}).then((result)=>{
                                                                                                        
                                                                                                        resolve()

                                                                                                    })
                                })

                        }else{
                            
                            console.log('already in cat')
                            reject({betterOfferInCatOffer:true})

                        }

                        
                    }else{

                        let offer = parseInt(data.offer)
                        
                        let off = (proDetails.mrp/100)*offer

                        let offerPrice= proDetails.mrp-off

                        offerPrice = offerPrice.toFixed(2)

                        offerPrice = parseInt(offerPrice)


                        
                        await db.get().collection(collection.PRODUCT_VARIENTS).updateOne({_id:objectId(proDetails._id)},
                                                                                            {$set:{mrp:offerPrice,oldProPrice:proDetails.mrp}}).then(async(result)=>{

                                                                                                await db.get().collection(collection.PRODUCT_OFFERS).insertOne({productName:data.product,
                                                                                                    offer:offer,
                                                                                                    startingDate:data.startingDate,
                                                                                                    expairyDate:data.expairyDate}).then(async(result)=>{

                                                                                                        
                                                                                                        resolve()

                                                                                                    })
                                                                                                

                                                                                            })

                        
                        
                    }


               
                
            }

        })

    },
    getAllProductOffer:()=>{

        return new Promise(async(resolve,reject)=>{

            let offers = await db.get().collection(collection.PRODUCT_OFFERS)
                                .find()
                                .toArray()
            if(offers){
                
                resolve(offers)

            }else{
                
                reject()

            }

        })
        
    },
    editProductOffer:(offerId)=>{
        
        return new Promise(async(resolve,reject)=>{
            
            let offer = await db.get().collection(collection.PRODUCT_OFFERS).findOne({_id:objectId(offerId)})
            
            //console.log(offer)
            resolve(offer)

        })

    },
    updateProductOffer:(offerId,newData)=>{

        return new Promise(async(resolve,reject)=>{
            
            //let isProductAvailable = await db.get().collection(collection.PRODUCT_OFFERS).findOne({productName:newData.product})

           


                offer = parseInt(newData.offer)
    
                
                                                                
                        let productId = await db.get().collection(collection.PRODUCTS).findOne({productName:newData.product})
                        let proDetails = await db.get().collection(collection.PRODUCT_VARIENTS).findOne({productId:productId._id})
                        let podductCatOfferDetails = await db.get().collection(collection.CATOFFERS).findOne({category:productId.category})
                        console.log(podductCatOfferDetails)
                        console.log(proDetails.oldCatPrice)
                        if(podductCatOfferDetails){
                            
                            let catOff = (proDetails.oldCatPrice/100)*podductCatOfferDetails.offer
                            let catOfferPrice= proDetails.oldCatPrice-catOff
                            catOfferPrice = catOfferPrice.toFixed(2)
                            catOfferPrice = parseInt(catOfferPrice)

                            let off = (proDetails.oldCatPrice/100)*offer
                            let offerPrice= proDetails.oldCatPrice-off
                            offerPrice = offerPrice.toFixed(2)
                            offerPrice = parseInt(offerPrice)
                            console.log(catOfferPrice,offerPrice)

                            if(catOfferPrice<offerPrice){

                                await db.get().collection(collection.PRODUCT_VARIENTS).updateMany({_id:objectId(proDetails._id)},
                                                                            {$set:{mrp:catOfferPrice,oldCatPrice:proDetails.oldCatPrice},
                                                                                $unset:{oldProPrice:""}}).then(async(response)=>{
                                                                                await db.get().collection(collection.PRODUCT_OFFERS).deleteOne({_id:objectId(offerId)})
                                                                                resolve({betterOfferInCatOffer:true}) 
    
                                                                            })
                                
                            }else{

                                await db.get().collection(collection.PRODUCT_VARIENTS).updateMany({_id:objectId(proDetails._id)},
                                                                            {$set:{mrp:offerPrice,oldProPrice:proDetails.oldCatPrice},
                                                                            $unset:{oldCatPrice:""}}).then(async(response)=>{
                                                                                
                                                                                await db.get().collection(collection.PRODUCT_OFFERS)
                                                                                .updateOne({_id:objectId(offerId)},{$set:{productName:newData.product,
                                                                                startingDate:newData.startingDate,
                                                                                expairyDate:newData.expairyDate,
                                                                                offer:offer}}).then(async(result)=>{
                                                                                    
                                                                                    resolve() 

                                                                                })
    
                                                                            })


                            }

                        }else{

                            let off = (proDetails.oldProPrice/100)*offer
                            let offerPrice= proDetails.oldProPrice-off
                            offerPrice = offerPrice.toFixed(2)
                            offerPrice = parseInt(offerPrice)
                            await db.get().collection(collection.PRODUCT_VARIENTS).updateMany({_id:objectId(proDetails._id)},
                                                                                {$set:{mrp:offerPrice,oldProPrice:proDetails.oldCatPrice},
                                                                                  $unset:{oldCatPrice:""}  }).then(async(response)=>{

                                                                                    await db.get().collection(collection.PRODUCT_OFFERS)
                                                                                    .updateOne({_id:objectId(offerId)},{$set:{productName:newData.product,
                                                                                    startingDate:newData.startingDate,
                                                                                    expairyDate:newData.expairyDate,
                                                                                    offer:offer}}).then(async(result)=>{

                                                                                        resolve() 

                                                                                    })
                                                                                    
        
                                                                                 })
                                                                                
                        }
                

        })

    },
    
    deleteProductOffer:(offerData)=>{

        return new Promise(async(resolve,reject)=>{
            
            console.log(offerData.productOffer)
            await db.get().collection(collection.PRODUCT_OFFERS).deleteOne({_id:objectId(offerData.productOffer) }).then(async(result)=>{
                
                let productId = await db.get().collection(collection.PRODUCTS).findOne({productName:offerData.productName})
                let proDetails = await db.get().collection(collection.PRODUCT_VARIENTS).findOne({productId:productId._id})

                let catOfferCheck = await db.get().collection(collection.CATOFFERS).findOne({category:productId.category})

                if(catOfferCheck){
                    
                    console.log(catOfferCheck)

                    let offer = parseInt(catOfferCheck.offer)
                        
                    let off = (proDetails.oldProPrice/100)*offer

                    let offerPrice= proDetails.oldProPrice-off

                    offerPrice = offerPrice.toFixed(2)

                    offerPrice = parseInt(offerPrice)
                    await db.get().collection(collection.PRODUCT_VARIENTS).updateOne({_id:objectId(proDetails._id)},
                                                                            {$unset:{oldProPrice:''},
                                                                            $set:{mrp:offerPrice,oldCatPrice:proDetails.oldProPrice}}).then((response)=>{
                                                                                
                                                                                resolve() 
    
                                                                            })


                }else{


                    await db.get().collection(collection.PRODUCT_VARIENTS).updateOne({_id:objectId(proDetails._id)},
                                                                                {$unset:{oldProPrice:''},
                                                                                $set:{mrp:proDetails.oldProPrice}}).then((response)=>{
                                                                                    
                                                                                    resolve() 
        
                                                                                })

                }




            })



        })

    }







}
                
            
                


                



            





                

                    


                    
                
                

                




                


            

        




    



