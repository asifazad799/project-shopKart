$("#updateAddress").validate({
  
    rules:{
            houseNumber:{
            required:true,
            },
            locality:{
            required:true,
            },
            district:{
            required:true,
            },
            state:{
            required:true,
            },
            pincode:{
            required:true,
            },
        },submitHandler:function submitForm(form) {
         
        Swal.fire({
        title: 'Are you sure?',
        text: "This Address will be updated",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
        if (result.isConfirmed) {
            form.submit();
            
        }
        })
        return false;
    }
  
  
  })