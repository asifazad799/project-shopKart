
 function deleteProductOffer12(Id,productName){

    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            
            $.ajax({

                url:'/admin/deleteProductOffer?productOffer='+Id+'&productName='+productName,
                method:'get',
                success:(response)=>{
                    
                    if(response.valid){

                        Swal.fire(
                            'Deleted!',
                            'Your file has been deleted.',
                            'success'
                        ).then((result)=>{
                            
                            window.location.reload()

                        })

                    }

                }

            })

           
        }
    })


}