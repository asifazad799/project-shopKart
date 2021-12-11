$.validator.addMethod("Email", function (value, element) {
    return this.optional(element) || value == value.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i);},'Enter a valid email'
    );
$.validator.addMethod("customName", function(value, element) { 
    return this.optional( element ) || /^([a-zA-Z])+([a-zA-Z])+$/.test( value ); 
  },'Enter a valid name');
     
		$("#user-signup").validate({       
      rules: {
        first_name: {
          required: true,
          minlength: 4,
          customName:true
        },
        lastname:{
          required:true,
          minlength:4,
          customName:true
        }
        ,
        email: {
          required: true,
          Email: true,
        },
        mobile:{
          required:true,
          minlength:10,
          
        },
        
        password:{
          required:true,
          minlength:8,
        } ,
        confirmPassword:{
          required:true,
          equalTo:'#password'
           
        }  
      },
      messages: {
        first_name: {
          required: "Enter atleast 8 characters"
        },
        email:{
          required: "Enter your email properly "
        },
        mobile:{
          required:"Enter atleast 10 characters"
        },
        password:{
         required: "Enter alteast 8 characters"
        }
      },
	
    })