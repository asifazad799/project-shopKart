$('#catOffer').validate({

    rules:{
        
        category:{
            required:true
        },
        subcategory:{
            required:true
        },
        startingDate:{
            required:true
        },
        expairyDate:{
            required:true
        },
        offer:{
            required:true,
            digits:true,
            max:100
        }

    },
    messages:{
        offer:{
            max:"maximum value can enter is 100"
        }
    }

})