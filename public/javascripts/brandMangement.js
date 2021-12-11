
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
            imagebox.innerHTML = `<img src="${url}" id="image" style="width:100%">`
            const image = document.getElementById('image')
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

$(document).ready(function() {

$('#categoryTable1').DataTable(); 

} )
function deleteBrand(id){
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
            url:"/admin/deleteBrand",
            method:"post",
            data:{brandId:id},
            success:(result)=>{
                if(result.status){
                Swal.fire(
                    'Deleted!',
                    'Your file has been deleted.',
                    'success'
                ).then((res)=>{
                    

                    location.href="/admin/brandmanagement"

                })
                    
    
                }
            }
            
        })
            
        }
    })
}

$('#add-Barnd').validate({
  
    rules:{
  
      brandName:{
        required:true,
      },
      image1:{
        required:true,
      }
  
  
    }
  })

