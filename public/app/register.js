$(() => {

    $('#loginn').click(()=>{
        console.log('login clicked')
        $('#content').load('html/login.html')
    })
  
    $('#signin').click(() => {
        let password = $('#password').val();
        let p1 = $('#password1').val();
        if (password != p1) {
            window.alert('Password Not match');
        }
        else {
            let name = $('#first').val() + ' ' + $('#last').val();
            let email = $('#email').val();
            let username = $('#username').val();
            let phone = $('#phone').val();
            $.get(`/user/${username}`,(data)=>{
                if(!(Object.keys(data).length === 0)){
                    window.alert('This username alredy exits')
                }
                else{
                    $.post('/user',{
                        name,email,password,phone,username
                    },(data)=>{
                        console.log(data)
                        window.alert(`The account for ${data.username} is created`)
                        $.post('/s/t',{
                            total:0,
                            user:data.id
                        },()=>{
                            console.log('done')
                        })
                        $('#content').load('html/dashboard.html')
                    })
                }
            })
            
        }


        console.log('signin clicked')
    })

    
})
