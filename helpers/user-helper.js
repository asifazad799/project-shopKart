   
var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectId;
const { response } = require("express");

module.exports = {
    
   
    doSignup:(userData)=>{
      return new Promise(async(resolve,reject)=>{

        userData.password=await bcrypt.hash(userData.password,10)
        delete userData.confirmPassword;

        let user = await db.get().collection(collection.USER_COLLECTION).findOne({$or:[{email:userData.email},{mobile:userData.mobile}]});
        

        
          
          if(userData.email==user?.email||userData.mobile==user?.mobile){
            
            if(userData.email==user?.email){
              
              console.log('Email already exist')
              resolve({status:true,msg:"Email already exist"})
              
            }
            else if(userData.mobile==user?.mobile){
    
              console.log('Mobile already exist')
                resolve({status:true,msg:"Mobile already exist"})
                console.log(user.mobile);
    
            }
          }else{

            await db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
  
                resolve(data);
    
              })
            
          }
  
            
        
      })
    },
    doLogin:(userData)=>{
      return new Promise(async(resolve,reject)=>{


        let loginStatus = false;
        let response = {};

        let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email});
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
      })
    },
    otpLogin:(phoneNumber)=>{

      // console.log(phoneNumber)

      return new Promise(async(resolve,reject)=>{
        
          let user = await db.get().collection(collection.USER_COLLECTION).findOne({mobile:phoneNumber})


            // console.log(user)
            if(user){

              resolve({userFound:true})

            }else{

              resolve({userFound:false})
            }

          
          

          

      })


    }
    // otpLogInUserVerification:(data)=>{
      
    //   return new Promise(async(resolve,reject)=>{
        

    //     let user = await db.get().collection(collection.USER_COLLECTION).findOne({})



    //   })

    // }

  
  
}