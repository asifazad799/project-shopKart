$('#catOffer').validate({

    rules:{
        
        product:{
            required:true
        },
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
            max:85,
            min:5
        }

    },
    messages:{
        offer:{
            max:"maximum value can enter is 100"
        }
    }

})