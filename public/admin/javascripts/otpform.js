let move=(e,p,c,n)=>{
    var length = document.getElementById(c).value.length;
    var maxlength = document.getElementById(c).getAttribute("maxlength");
    if(length==maxlength){
        if(n!=''){
            document.getElementById(n).focus();
        }
    }
    if(e.key=="Backspace"){
        if(p!=''){
            document.getElementById(p).focus();
        }
        
    }
}

const startOtpCount = 0.1;
let time = startOtpCount*60;
const countdown = document.getElementById('otpTimer');
const resendOtpButton = document.getElementById('otpResendButton');

var t = setInterval(updateCoundown,1000);

function updateCoundown(){

    const minutes = Math.floor(time/60);
    let seconds = time % 60;

    seconds = seconds < 10 ? '0' + seconds : seconds;

    countdown.innerHTML = `${minutes}:${seconds}`;
    if(minutes<0){
        clearInterval(t);
        countdown.innerHTML = `00:00`;
        resendOtpButton.classList.remove('isDisabled');
    }else{
        time--;
    }
    
}