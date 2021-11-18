var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectId;
const { response } = require("express");
const { PRODUCT_VARIENTS, PRODUCTS } = require("../config/collection");

module.exports = {


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

                // currentSubCategory.forEach(element => {
                    
                // if(element==x){

                //     //console.log(element);
                //     isAvailable = true;
                    


                // }else{

                //     //console.log('not found')
                //     isAvailable = false;

                // }});

                //console.log(isAvailable)

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

                        //console.log(varientResult.insertedId);

                        // let d=db.get().collection(collection.PRODUCTS).findOne({_id:result.insertedId}).then((re)=>{

                        //     console.log(re)

                        // })

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

            

             let cc = await db.get().collection(collection.PRODUCTS).aggregate([{
                                                                        $lookup: {
                                                                        from: PRODUCT_VARIENTS,
                                                                        localField: "_id" ,
                                                                        foreignField: "productId",
                                                                        as: "productVarients"
                                                                        }}]).toArray()

                                                                        // let v = cc[0].productVarients

                                                                        // v.map(x=> console.log(x._id))

                                                                        // let varient = null;

                                                                        // for(let i = 0 ; i<=0 ; i++){

                                                                        //    varient = v[i]

                                                                        // }

                                                                        // console.log(varient._id);
                                                                        // let varientId = varient._id;
                                                                        // console.log(v)
                                                                        //  cc.map( (value) =>  {console.log(value.productVarients)})
                                                                        
                 resolve(cc)


            // await db.get().collection(collection.PRODUCTS).find().toArray(async(err,productdata)=>{

            //     //console.log(data)

            //     if(productdata){

            //          var gh = await db.get().collection(collection.PRODUCT_VARIENTS).find({productId:productdata._id}).toArray()

            //         console.log(productdata._id)

            //         resolve()
                    

            //     }

            // })
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

            // console.log(varientId.varientId);

            await db.get().collection(collection.PRODUCT_VARIENTS).updateOne({_id:objectId(varientId.varientId)},{$set:{size:data.size,color:data.color,landingcost:data.landingcost,mrp:data.mrp,quantity:data.quantity}}).then((result)=>{
                
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


    }






            

           



    
}
                
            
                


                



            





                

                    


                    
                
                

                




                


            

        




    



