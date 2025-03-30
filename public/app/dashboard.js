$(()=>{
    // Initialize payment modal
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    
    // Handle join contest button click
    $('#join-contest').click(()=>{
        $.get('/user/islogin',(data)=>{
            if(!data){
                window.alert('Please login first to join contests');
                $('#content').load('html/login.html');
            } else {
                // Show payment modal
                paymentModal.show();
            }
        });
    });

    // Handle start match button click
    $('#start-match').click(()=>{
        console.log('cart clicked')
        $.get('/user/islogin',(data)=>{
            if(!data){
                window.alert('Please login first')
                $('#content').load('html/login.html')
            } else {
                $('#content').load('html/match.html')
            }
        })
    });
})