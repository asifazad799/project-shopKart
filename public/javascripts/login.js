$.validator.addMethod("Email", function (value, element) {
    return this.optional(element) || value == value.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i);},'Enter a valid email'
    );

    $('#userLogin').validate({
    
        rules:{
            email: {
                required: true,
                Email: true,
            },
            password:{
                required:true,
                minlength:8,
            } 
        }
    
    })
$('#otpLogin').validate({

    rules:{
      mobile:{
        required:true,
        minlength:10
      }
    }
  })



  function setInputFilter(textbox, inputFilter) {
["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
  textbox.addEventListener(event, function() {
    if (inputFilter(this.value)) {
      this.oldValue = this.value;
      this.oldSelectionStart = this.selectionStart;
      this.oldSelectionEnd = this.selectionEnd;
    } else if (this.hasOwnProperty("oldValue")) {
      this.value = this.oldValue;
      this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
    } else {
      this.value = "";
    }
  });
});
}

setInputFilter(document.getElementById("mobile"), function(value) {
return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 9999999999); });

