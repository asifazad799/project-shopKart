// $("#editProduct").validate({

//     rules:{

//         sizes:{
//             required:true
//         },
//         color:{
//             required:true
//         },
//         landingcost:{
//             required:true
//         },
//         mrp:{
//             required:true
//         },
//         quantity:{
//             required:true
//         },
       
//     }

// })

$("#updateVarientProduct").validate({
    rules:{
      productName:{
        required:true
      },
      brand:{
        required:true
      },
      category:{
        required:true
      },
      subcategory:{
        required:true
      },
      discription:{
        required:true
      },
      sizes:{
        required:true
      },
      color:{
        required:true
      },
      landingcost:{
        required:true,
        digits:true
      },
      mrp:{
        required:true,
        digits:true
      },
      quantity:{
        required:true,
        min:1,
        digits:true
      }

    }
  })


     

        let currentSubCat = document.getElementById('subcategory').value;
        if(currentSubCat=='shirt'){

          let x = ['S','M'];

          let Count = x.length;

                var xoptions = "<option value='0'>select</option>"

                for(let i = 0 ; i < Count ; i++ ){

                  xoptions += "<option value='"+x[i]+"'>"+x[i]+"</option>"

                } document.getElementById('Psizes').innerHTML = xoptions;



        }else if(currentSubCat == 'shoes'){


          let x = ['10','9'];

          let Count = x.length;

                var xoptions = "<option value='0'>select</option>"

                for(let i = 0 ; i < Count ; i++ ){

                  xoptions += "<option value='"+x[i]+"'>"+x[i]+"</option>"

                } document.getElementById('Psizes').innerHTML = xoptions;


        }
        


    function fileValidation1() {
        const imagebox = document.getElementById('image-box')
        const crop_btn = document.getElementById('crop-btn')
        var fileInput = document.getElementById('file1');

        var filePath = fileInput.value;
        var allowedExtensions = /(\.jpg)$/i;
        if (!allowedExtensions.exec(filePath)) {
            alert('Please upload file having extensions .jpeg only.');
            fileInput.value = '';
            return false;
        } else {
            //Image preview
            const img_data = fileInput.files[0]
            const url = URL.createObjectURL(img_data)
            imagebox.innerHTML = `<img src="${url}" id="imagep1" style="width:100%">`
            const image = document.getElementById('imagep1')
            document.getElementById('image-box').style.display = 'block'
            document.getElementById('crop-btn').style.display = 'block'
            document.getElementById('confirm-btn').style.display = 'none'

            const cropper = new Cropper(image, {
                autoCropArea: 1,
                viewMode: 1,
                scalable: true,
                zoomable: true,
                movable: true,
                aspectRatio: 16 / 19,
                //  preview: '.preview',
                minCropBoxWidth: 180,
                minCropBoxHeight: 240,
            })
            crop_btn.addEventListener('click', () => {
                cropper.getCroppedCanvas().toBlob((blob) => {
                    let fileInputElement = document.getElementById('file1');
                    let file = new File([blob], img_data.name, { type: "image/*", lastModified: new Date().getTime() });
                    let container = new DataTransfer();

                    container.items.add(file);
                    const img = container.files[0]
                    var url = URL.createObjectURL(img)
                    fileInputElement.files = container.files;
                    document.getElementById('imgview1').src = url
                    document.getElementById('image-box').style.display = 'none'
                    document.getElementById('crop-btn').style.display = 'none'
                    document.getElementById('confirm-btn').style.display = 'block'
                });
            });
        }
    }

    function fileValidation2() {
        const imagebox = document.getElementById('image-box2')
        const crop_btn = document.getElementById('crop-btn2')
        var fileInput = document.getElementById('file2');

        var filePath = fileInput.value;
        var allowedExtensions = /(\.jpg)$/i;
        if (!allowedExtensions.exec(filePath)) {
            alert('Please upload file having extensions .jpeg only.');
            fileInput.value = '';
            return false;
        } else {
            //Image preview
            const img_data = fileInput.files[0]
            const url = URL.createObjectURL(img_data)
            imagebox.innerHTML = `<img src="${url}" id="imagep2" style="width:100%">`
            const image = document.getElementById('imagep2')
            document.getElementById('image-box2').style.display = 'block'
            document.getElementById('crop-btn2').style.display = 'block'
            document.getElementById('confirm-btn').style.display = 'none'

            const cropper = new Cropper(image, {
                autoCropArea: 1,
                viewMode: 1,
                scalable: true,
                zoomable: true,
                movable: true,
                aspectRatio: 16 / 19,
                //  preview: '.preview',
                minCropBoxWidth: 180,
                minCropBoxHeight: 240,
            })
            crop_btn.addEventListener('click', () => {
                cropper.getCroppedCanvas().toBlob((blob) => {
                    let fileInputElement = document.getElementById('file2');
                    let file = new File([blob], img_data.name, { type: "image/*", lastModified: new Date().getTime() });
                    let container = new DataTransfer();

                    container.items.add(file);
                    const img = container.files[0]
                    var url = URL.createObjectURL(img)
                    fileInputElement.files = container.files;
                    document.getElementById('imgview2').src = url
                    document.getElementById('image-box2').style.display = 'none'
                    document.getElementById('crop-btn2').style.display = 'none'
                    document.getElementById('confirm-btn').style.display = 'block'
                });
            });
        }
    }
    function fileValidation3() {
        const imagebox = document.getElementById('image-box3')
        const crop_btn = document.getElementById('crop-btn3')
        var fileInput = document.getElementById('file3');

        var filePath = fileInput.value;
        var allowedExtensions = /(\.jpg)$/i;
        if (!allowedExtensions.exec(filePath)) {
            alert('Please upload file having extensions .jpeg only.');
            fileInput.value = '';
            return false;
        } else {
            //Image preview
            const img_data = fileInput.files[0]
            const url = URL.createObjectURL(img_data)
            imagebox.innerHTML = `<img src="${url}" id="imagep3" style="width:100%">`
            const image = document.getElementById('imagep3')
            document.getElementById('image-box3').style.display = 'block'
            document.getElementById('crop-btn3').style.display = 'block'
            document.getElementById('confirm-btn').style.display = 'none'

            const cropper = new Cropper(image, {
                autoCropArea: 1,
                viewMode: 1,
                scalable: true,
                zoomable: true,
                movable: true,
                aspectRatio: 16 / 19,
                //  preview: '.preview',
                minCropBoxWidth: 180,
                minCropBoxHeight: 240,
            })
            crop_btn.addEventListener('click', () => {
                cropper.getCroppedCanvas().toBlob((blob) => {
                    let fileInputElement = document.getElementById('file3');
                    let file = new File([blob], img_data.name, { type: "image/*", lastModified: new Date().getTime() });
                    let container = new DataTransfer();

                    container.items.add(file);
                    const img = container.files[0]
                    var url = URL.createObjectURL(img)
                    fileInputElement.files = container.files;
                    document.getElementById('imgview3').src = url
                    document.getElementById('image-box3').style.display = 'none'
                    document.getElementById('crop-btn3').style.display = 'none'
                    document.getElementById('confirm-btn').style.display = 'block'
                });
            });
        }
    }
    function fileValidation4() {
        const imagebox = document.getElementById('image-box4')
        const crop_btn = document.getElementById('crop-btn4')
        var fileInput = document.getElementById('file4');

        var filePath = fileInput.value;
        var allowedExtensions = /(\.jpg)$/i;
        if (!allowedExtensions.exec(filePath)) {
            alert('Please upload file having extensions .jpeg only.');
            fileInput.value = '';
            return false;
        } else {
            //Image preview
            const img_data = fileInput.files[0]
            const url = URL.createObjectURL(img_data)
            imagebox.innerHTML = `<img src="${url}" id="imagep4" style="width:100%">`
            const image = document.getElementById('imagep4')
            document.getElementById('image-box4').style.display = 'block'
            document.getElementById('crop-btn4').style.display = 'block'
            document.getElementById('confirm-btn').style.display = 'none'

            const cropper = new Cropper(image, {
                autoCropArea: 1,
                viewMode: 1,
                scalable: true,
                zoomable: true,
                movable: true,
                aspectRatio: 16 / 19,
                //  preview: '.preview',
                minCropBoxWidth: 180,
                minCropBoxHeight: 240,
            })
            crop_btn.addEventListener('click', () => {
                cropper.getCroppedCanvas().toBlob((blob) => {
                    let fileInputElement = document.getElementById('file4');
                    let file = new File([blob], img_data.name, { type: "image/*", lastModified: new Date().getTime() });
                    let container = new DataTransfer();

                    container.items.add(file);
                    const img = container.files[0]
                    var url = URL.createObjectURL(img)
                    fileInputElement.files = container.files;
                    document.getElementById('imgview4').src = url
                    document.getElementById('image-box4').style.display = 'none'
                    document.getElementById('crop-btn4').style.display = 'none'
                    document.getElementById('confirm-btn').style.display = 'block'
                });
            });
        }
    }
    
