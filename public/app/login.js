
$(()=>{

    $('#register').click(()=>{
        console.log('registed clicked')
        $('#content').load('html/Register.html')
    })
    $('#Register').click(()=>{
        console.log('registed clicked')
        $('#content').load('html/Register.html')
    })

    $('#logg').click(()=>{
        let username=$('#username').val();
        let password=$('#password').val();
        $.post('/user/login',{
            username,password
        },(data)=>{
           
            if(data.Error){
                window.alert(`${data.Error}`)
            }
            else{
                console.log(data);
                window.sessionStorage.user=data[0].id;
                window.alert('login Successfully')
                
                $('#user_login').empty()
                $('#content').load('html/dashboard.html')
                $('#user_login').append(`
                <span id="user_login"><button class="btn btn-outline-primary ms-4 me-5 btn" id="logout" type="button"> Logout</button></span>

                `)
                activelogout();
            }
        })
        console.log('loggg clicked')
    })


})

