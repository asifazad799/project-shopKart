$('#changePassword').validate({

    rules:{

        password:{
            required:true,
            minlength:8
        },
        confirmPassword:{
            required:true,
            equalTo:'#password'
        }

    },submitHandler:function resetPasswordConfirmation(form) {
                swal({
                    title: "Are you sure?",
                    text: "Your Password will be changed",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                })
                .then((isOkay) => {
                    if (isOkay) {
                        form.submit();
                    }
                });
                return false;
    }
    
})