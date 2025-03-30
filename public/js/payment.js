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
                showSuccessMessage('Payment successful! You have been added to the contest.');
                // Redirect to contest page or update UI
                setTimeout(() => {
                    window.location.href = '/contest/' + contestId;
                }, 2000);
            } else {
                showErrorMessage('Payment verification failed. Please contact support.');
            }
        },
        error: function() {
            showErrorMessage('Something went wrong. Please try again.');
        }
    });
}

function showSuccessMessage(message) {
    // Create and show success toast
    const toast = `
        <div class="toast-container position-fixed top-0 end-0 p-3">
            <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header bg-success text-white">
                    <strong class="me-auto">Success</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        </div>
    `;
    $('body').append(toast);
    $('.toast').toast('show');
}

function showErrorMessage(message) {
    // Create and show error toast
    const toast = `
        <div class="toast-container position-fixed top-0 end-0 p-3">
            <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header bg-danger text-white">
                    <strong class="me-auto">Error</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        </div>
    `;
    $('body').append(toast);
    $('.toast').toast('show');
} 