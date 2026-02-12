import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { initiatePayment, clearPaymentError, clearSuccessMessage } from './paymentSlice';
import { apiClient } from '../../config/apiConfig';
import './PaymentForm.css';

// Initialize Stripe with publishable key from environment
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const StripeCardPaymentForm = ({ bookingId, amount, currency, paymentMethod, onPaymentSuccess, loading: parentLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  // Create payment intent on mount
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await apiClient.post('/payment', {
          bookingId: Number(bookingId),
          amount: Number(amount),
          currency,
          paymentMethod,
        });
        if (response.data && response.data.clientSecret) {
          setClientSecret(response.data.clientSecret);
        }
      } catch (error) {
        setCardError(error.response?.data?.message || 'Failed to create payment intent');
      }
    };

    if (bookingId && amount) {
      createPaymentIntent();
    }
  }, [bookingId, amount, currency, paymentMethod]);

  const handleCardChange = (e) => {
    setCardError(e.error ? e.error.message : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setCardError('Payment initialization failed. Please try again.');
      return;
    }

    setProcessing(true);
    setCardError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: 'Customer' },
        },
      });

      if (error) {
        setCardError(error.message);
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent);
      }
    } catch (error) {
      setCardError(error.message || 'An error occurred during payment processing');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-payment-form">
      <div className="stripe-card-container">
        <label className="form-label">Card Details</label>
        <CardElement
          onChange={handleCardChange}
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      {cardError && <div className="alert alert-danger stripe-error">{cardError}</div>}

      <button
        type="submit"
        className="btn btn-primary payment-btn"
        disabled={!stripe || !elements || !clientSecret || processing || parentLoading}
      >
        {processing ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Processing Payment...
          </>
        ) : (
          `Pay ₹${amount || '0'}`
        )}
      </button>
    </form>
  );
};

const PaymentForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const { paymentStatus, loading, error, successMessage } = useSelector((state) => state.payment);
  const { bookings } = useSelector((state) => state.bookingHistory);

  const [formData, setFormData] = useState({
    bookingId: bookingId || '',
    paymentMethod: 'card',
    amount: '',
    currency: 'INR',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const booking = formData.bookingId ? bookings?.find(b => b.id === Number(formData.bookingId)) : null;

  useEffect(() => {
    // Auto-fill amount if booking is selected
    if (booking) {
      setFormData(prev => ({ ...prev, amount: booking.amount || booking.fare || '' }));
    }
  }, [booking]);

  const validateForm = () => {
    const errors = {};

    if (!formData.bookingId) errors.bookingId = 'Booking is required';
    if (!formData.amount || formData.amount <= 0) errors.amount = 'Valid amount is required';
    if (!formData.paymentMethod) errors.paymentMethod = 'Payment method is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    setPaymentConfirmed(true);
    // The webhook will update payment status, but we can also show success immediately
    setTimeout(() => {
      navigate('/booking-history');
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (formData.paymentMethod === 'card') {
      // Stripe form will handle submission
    } else {
      // For non-card payments, initiate directly
      const paymentData = {
        bookingId: Number(formData.bookingId),
        amount: Number(formData.amount),
        currency: formData.currency,
        paymentMethod: formData.paymentMethod,
      };
      dispatch(initiatePayment(paymentData));
    }
  };

  useEffect(() => {
    if (successMessage || paymentConfirmed) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
        navigate('/booking-history');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, paymentConfirmed, dispatch, navigate]);

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2 className="payment-title">Complete Payment</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {typeof error === 'string' ? error : error.message}
            <button
              type="button"
              className="btn-close"
              onClick={() => dispatch(clearPaymentError())}
            />
          </div>
        )}

        {(successMessage || paymentConfirmed) && (
          <div className="alert alert-success" role="alert">
            {successMessage || 'Payment successful! Redirecting...'}
          </div>
        )}

        {paymentStatus && (
          <div className={`alert alert-${paymentStatus.status === 'succeeded' ? 'success' : 'info'}`}>
            <p><strong>Payment Status:</strong> {paymentStatus.status}</p>
            <p><strong>Payment ID:</strong> {paymentStatus.paymentId}</p>
            <p><strong>Amount:</strong> ₹{paymentStatus.amount} {paymentStatus.currency}</p>
            {paymentStatus.message && <p>{paymentStatus.message}</p>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label htmlFor="bookingId" className="form-label">
              Select Booking *
            </label>
            <select
              id="bookingId"
              name="bookingId"
              className={`form-control ${validationErrors.bookingId ? 'is-invalid' : ''}`}
              value={formData.bookingId}
              onChange={handleChange}
              disabled={loading || paymentConfirmed}
            >
              <option value="">Choose a booking...</option>
              {bookings?.map(b => (
                <option key={b.id} value={b.id}>
                  {b.from} → {b.to} (₹{b.amount || b.fare})
                </option>
              ))}
            </select>
            {validationErrors.bookingId && (
              <div className="invalid-feedback">{validationErrors.bookingId}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="amount" className="form-label">
              Amount *
            </label>
            <div className="input-group">
              <span className="input-group-text">₹</span>
              <input
                type="number"
                id="amount"
                name="amount"
                className={`form-control ${validationErrors.amount ? 'is-invalid' : ''}`}
                placeholder="Enter amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                disabled={loading || paymentConfirmed}
              />
            </div>
            {validationErrors.amount && (
              <div className="invalid-feedback">{validationErrors.amount}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="paymentMethod" className="form-label">
              Payment Method *
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              className={`form-control ${validationErrors.paymentMethod ? 'is-invalid' : ''}`}
              value={formData.paymentMethod}
              onChange={handleChange}
              disabled={loading || paymentConfirmed}
            >
              <option value="card">Credit/Debit Card (Stripe)</option>
              <option value="upi">UPI</option>
              <option value="wallet">Digital Wallet</option>
            </select>
            {validationErrors.paymentMethod && (
              <div className="invalid-feedback">{validationErrors.paymentMethod}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="currency" className="form-label">
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              className="form-control"
              value={formData.currency}
              onChange={handleChange}
              disabled={loading || paymentConfirmed}
            >
              <option value="INR">Indian Rupee (INR)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>

          {formData.paymentMethod === 'card' && formData.bookingId && formData.amount ? (
            <Elements stripe={stripePromise}>
              <StripeCardPaymentForm
                bookingId={formData.bookingId}
                amount={formData.amount}
                currency={formData.currency}
                paymentMethod={formData.paymentMethod}
                onPaymentSuccess={handlePaymentSuccess}
                loading={loading}
              />
            </Elements>
          ) : formData.paymentMethod !== 'card' ? (
            <button
              type="submit"
              className="btn btn-primary payment-btn"
              disabled={loading || !formData.amount || paymentConfirmed}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                `Pay ₹${formData.amount || '0'}`
              )}
            </button>
          ) : null}
        </form>

        <div className="payment-info">
          <p className="text-muted">
            <small>
              🔒 Your payment is secured with Stripe. No card details are stored on our servers.
            </small>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
