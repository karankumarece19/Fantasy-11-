const route = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_lUC9qKC6TKeED1",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "your_key_secret"
});

// Payment verification route
route.post('/verify', async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            contestId
        } = req.body;

        // Verify signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "your_key_secret")
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment is verified
            // Here you would typically:
            // 1. Update the contest entry in your database
            // 2. Add the user to the contest
            // 3. Update user's wallet/balance if needed
            
            res.json({
                success: true,
                message: "Payment verified successfully"
            });
        } else {
            res.json({
                success: false,
                message: "Invalid payment signature"
            });
        }
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({
            success: false,
            message: "Payment verification failed"
        });
    }
});

module.exports = { route }; 