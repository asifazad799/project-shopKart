$(document).ready(()=>{
    $("#user-signup").validate({       
  rules: {
    first_name: {
      required: true,
      minlength: 4,
    },
    email: {
      required: true,
      email: true,
    },
    mobile1:{
      required:true,
      minlength:10,
      maxlength:10
    },
    password:{
      required:true,
      minlength:8,
    }   
  },
  messages: {
    first_name: {
      required: "Enter atleast 8 characters"
    },
    email:{
      required: "Enter your email properly "
    },
    mobile1:{
      required:"Enter atleast 10 characters"
    },
    password:{
     required: "Enter alteast 8 characters"
    }
  },

})
})      