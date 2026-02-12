import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createRazorpayOrder, verifyRazorpayPayment, clearPaymentError, clearSuccessMessage } from './paymentSlice';
import './RazorpayPaymentForm.css';

const RazorpayPaymentForm = ({ bookingId, amount, currency = 'INR', customerEmail, customerPhone, customerName, onPaymentSuccess }) => {
  const dispatch = useDispatch();
  const { razorpayOrder, loading, error, successMessage } = useSelector((state) => state.payment);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);

  // Create Razorpay order on mount
  useEffect(() => {
    if (bookingId && amount) {
      dispatch(createRazorpayOrder({
        bookingId,
        amount,
        currency,
        paymentMethod,
      }));
    }
  }, [bookingId, amount, currency, dispatch, paymentMethod]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handlePayment = () => {
    if (!razorpayOrder || !window.Razorpay) {
      alert('Payment gateway not ready. Please try again.');
      return;
    }

    setProcessing(true);

    const options = {
      key: razorpayOrder.razorpayKeyId,
      amount: amount * 100, // Convert to paise
      currency: currency,
      order_id: razorpayOrder.orderId,
      name: 'Indicab',
      description: `Booking Payment #${bookingId}`,
      image: '/indicab-logo.png',
      handler: async (response) => {
        // Payment successful - verify signature
        const verificationData = {
          orderId: razorpayOrder.orderId,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        };

        await dispatch(verifyRazorpayPayment(verificationData));
        setProcessing(false);

        // Call success callback
        if (response.razorpay_payment_id) {
          onPaymentSuccess({
            paymentIntentId: response.razorpay_payment_id,
            status: 'succeeded',
          });
        }
      },
      prefill: {
        name: customerName || '',
        email: customerEmail || '',
        contact: customerPhone || '',
      },
      notes: {
        booking_id: bookingId,
      },
      method: {
        upi: paymentMethod === 'upi',
        card: paymentMethod === 'card',
        netbanking: paymentMethod === 'netbanking',
        wallet: paymentMethod === 'wallet',
      },
      theme: {
        color: '#667eea',
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();

      // Handle payment failure
      razorpay.on('payment.failed', (response) => {
        setProcessing(false);
        alert(`Payment failed: ${response.error.description}`);
      });
    } catch (err) {
      setProcessing(false);
      alert('Failed to open payment gateway: ' + err.message);
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  return (
    <div className="razorpay-payment-form">
      {error && (
        <div className="alert alert-danger razorpay-alert">
          {error}
          <button
            className="alert-close"
            onClick={() => dispatch(clearPaymentError())}
            type="button"
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success razorpay-alert">
          {successMessage}
        </div>
      )}

      <div className="payment-method-selector">
        <h5 className="method-title">Select Payment Method</h5>
        <div className="method-options">
          <label className="method-option">
            <input
              type="radio"
              name="paymentMethod"
              value="upi"
              checked={paymentMethod === 'upi'}
              onChange={handlePaymentMethodChange}
              disabled={loading || processing}
            />
            <span className="method-label">
              <i className="bi bi-phone"></i>
              UPI
            </span>
            <span className="method-description">Google Pay, PhonePe, Paytm</span>
          </label>

          <label className="method-option">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={handlePaymentMethodChange}
              disabled={loading || processing}
            />
            <span className="method-label">
              <i className="bi bi-credit-card"></i>
              Credit/Debit Card
            </span>
            <span className="method-description">Visa, Mastercard, RuPay</span>
          </label>

          <label className="method-option">
            <input
              type="radio"
              name="paymentMethod"
              value="netbanking"
              checked={paymentMethod === 'netbanking'}
              onChange={handlePaymentMethodChange}
              disabled={loading || processing}
            />
            <span className="method-label">
              <i className="bi bi-building"></i>
              Net Banking
            </span>
            <span className="method-description">All major Indian banks</span>
          </label>

          <label className="method-option">
            <input
              type="radio"
              name="paymentMethod"
              value="wallet"
              checked={paymentMethod === 'wallet'}
              onChange={handlePaymentMethodChange}
              disabled={loading || processing}
            />
            <span className="method-label">
              <i className="bi bi-wallet2"></i>
              Digital Wallets
            </span>
            <span className="method-description">Paytm, FreeCharge, Airtel Money</span>
          </label>
        </div>
      </div>

      <div className="payment-details">
        <p className="detail-item">
          <strong>Booking ID:</strong> {bookingId}
        </p>
        <p className="detail-item">
          <strong>Amount:</strong> ₹{amount.toFixed(2)}
        </p>
        <p className="detail-item">
          <strong>Currency:</strong> {currency}
        </p>
      </div>

      <button
        className="btn btn-primary razorpay-pay-btn"
        onClick={handlePayment}
        disabled={!razorpayOrder || loading || processing}
      >
        {processing ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Processing Payment...
          </>
        ) : loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Initializing Payment...
          </>
        ) : (
          `Pay ₹${amount.toFixed(2)}`
        )}
      </button>

      <p className="security-note">
        <i className="bi bi-shield-check"></i>
        Secured by Razorpay. Your payment information is encrypted and safe.
      </p>
    </div>
  );
};

export default RazorpayPaymentForm;
