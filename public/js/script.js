$(()=>{
    // Hide content initially
    $('#content').hide();
    
    // Load dashboard content
    $('#content').load('/html/dashboard.html', function() {
        // Show content after it's loaded
        $('#content').fadeIn();
        // Show FAQ section for dashboard
        $('.faq-section').show();
        // Show footer for dashboard
        $('#footer-container').load('/components/footer.html');
    });

    // Check login status
    $.get('/user/islogin',(data)=>{
        console.log('islogin clicked')
        if(data){
            $('#user_login').empty()
            $('#user_login').append(`
            <span id="user_login"><button class="btn btn-outline-primary ms-4 me-5 btn" id="logout" type="button"> Logout</button></span>
            `)
            activelogout();
        }
    })

    $('#profile').click(()=>{
        $('#content').fadeOut(() => {
            $('#content').empty()
            $('#content').load('html/products.html', function() {
                $('#content').fadeIn();
                // Hide FAQ section for other pages
                $('.faq-section').hide();
                // Hide footer for other pages
                $('#footer-container').empty();
            });
        });
    })

    $('#register').click(()=>{
        $('#content').fadeOut(() => {
            $('#content').empty()
            $('#content').load('/html/Register.html', function() {
                $('#content').fadeIn();
                // Hide FAQ section for other pages
                $('.faq-section').hide();
                // Hide footer for other pages
                $('#footer-container').empty();
            });
        });
    })

    $('#login').click(()=>{
        $('#content').fadeOut(() => {
            $('#content').empty()
            $('#content').load('/html/login.html', function() {
                $('#content').fadeIn();
                // Hide FAQ section for other pages
                $('.faq-section').hide();
                // Hide footer for other pages
                $('#footer-container').empty();
            });
        });
    })

    // Handle start match button click
    $(document).on('click', '#start-match', function() {
        // Hide footer when starting match
        $('#footer-container').empty();
    })
    
    $('#logout').click(()=>{
        console.log('logout clicked')
    })
})

function getinner(data){
    // for get the type of data
    window.sessionStorage.product=data.innerText;
    $('#content').fadeOut(() => {
        $('#content').empty()
        $('#content').load('html/products.html', function() {
            $('#content').fadeIn();
            // Hide FAQ section for other pages
            $('.faq-section').hide();
            // Hide footer for other pages
            $('#footer-container').empty();
        });
    });
}

console.log('js connected')

async function activelogout(){
    $('#logout').click(()=>{
        console.log('logout clicked')
        $.get('/user/logout',()=>{
            window.alert('logout sucessfully')
            location.reload('index.html')
        })
    })
}