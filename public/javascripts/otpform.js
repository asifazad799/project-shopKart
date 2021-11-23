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

const startOtpCount = .3;
let time = startOtpCount*60;
const countdown = document.getElementById('otpTimer');
const resendOtpButton = document.getElementById('otpResendButton');

let t=setInterval(updateCoundown,1000);

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

resendOtpButton.addEventListener('click',resetTimer)

function resetTimer(){

    // setInterval(updateCoundown,1000);

    countdown.classList.add('hide')
    document.getElementById('resendotpTimer').classList.remove('hide')




 
        var timeleft = 15;
    
        var downloadTimer = setInterval(function function1(){
        document.getElementById('resendotpTimer').innerHTML = timeleft + 
        " "+"seconds remaining";
    
        timeleft -= 1;
        if(timeleft <= 0){
            clearInterval(downloadTimer);
            document.getElementById('resendotpTimer').innerHTML = "Time is up!"
        }
        }, 1000);
    
        console.log(countdown);

        var phoneNumber = document.getElementById("mobile").value;

        $.ajax({
            url:'/otpResend?phonenumber='+phoneNumber,
            method:'get',
            success:(response)=>{
                if(response){
                    
                }else{
                    document.getElementById("otpErr").classList.remove("otpErr");
                }
            }
        })

}


    

    

function otpSend(){

    // console.log('ouasdas')

var first = document.getElementById("otp1").value;
var second = document.getElementById("otp2").value;
var third = document.getElementById("otp3").value;
var fourth = document.getElementById("otp4").value;
 

 var otpnumber = first+second+third+fourth
 var phoneNumber = document.getElementById("mobile").value;


    $.ajax({
    url:'/otpConfirm?phonenumber='+phoneNumber+'&otpnumber='+otpnumber,
    method:'get',
    success:(response)=>{
    if(response){
        window.location.replace("/");
    }else{
        document.getElementById("otpErr").classList.remove("otpErr");
    }
    }
    })
}

