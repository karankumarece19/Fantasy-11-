// Payment Integration with Razorpay
function initializePayment(amount, contestId) {
    const options = {
        key: "rzp_test_lUC9qKC6TKeED1", // Replace with your Razorpay Key ID
        amount: amount * 100, // Amount in paise
        currency: "INR",
        name: "Fantasy11",
        description: "Contest Entry Fee",
        handler: function (response) {
            // Handle successful payment
            handlePaymentSuccess(response, contestId);
        },
        prefill: {
            name: "User Name",
            email: "user@example.com",
            contact: "9999999999"
        },
        notes: {
            contestId: contestId
        },
        theme: {
            color: "#216ce4"
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}

function handlePaymentSuccess(response, contestId) {
    // Send payment details to server
    $.ajax({
        url: '/payment/verify',
        method: 'POST',
        data: {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            contestId: contestId
        },
        success: function(response) {
            if(response.success) {
                // Close the payment modal if it's open
                const paymentModal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
                if (paymentModal) {
                    paymentModal.hide();
                }
                
                // Show success message with animation
                showSuccessMessage('🎉 Congratulations! You have successfully joined the contest! 🎉');
                
                // Redirect to contest page after a delay
                setTimeout(() => {
                    window.location.href = '/contest/' + contestId;
                }, 3000);
            } else {
                showErrorMessage(response.message || 'Payment verification failed. Please contact support.');
            }
        },
        error: function(xhr, status, error) {
            console.error('Payment verification error:', error);
            showErrorMessage('Something went wrong. Please try again.');
        }
    });
}

function showSuccessMessage(message) {
    // Remove any existing toasts
    $('.toast-container').remove();
    
    // Create new toast with enhanced styling
    const toast = `
        <div class="toast-container position-fixed top-50 start-50 translate-middle">
            <div class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="fas fa-check-circle me-2"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        </div>
    `;
    
    // Add toast to body
    $('body').append(toast);
    
    // Show toast with animation
    const toastElement = $('.toast');
    toastElement.toast({
        animation: true,
        autohide: false,
        delay: 3000
    }).toast('show');
    
    // Remove toast after it's hidden
    toastElement.on('hidden.bs.toast', function () {
        $('.toast-container').remove();
    });
}

function showErrorMessage(message) {
    // Remove any existing toasts
    $('.toast-container').remove();
    
    // Create new toast with enhanced styling
    const toast = `
        <div class="toast-container position-fixed top-50 start-50 translate-middle">
            <div class="toast align-items-center text-white bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        </div>
    `;
    
    // Add toast to body
    $('body').append(toast);
    
    // Show toast with animation
    const toastElement = $('.toast');
    toastElement.toast({
        animation: true,
        autohide: false,
        delay: 3000
    }).toast('show');
    
    // Remove toast after it's hidden
    toastElement.on('hidden.bs.toast', function () {
        $('.toast-container').remove();
    });
} 