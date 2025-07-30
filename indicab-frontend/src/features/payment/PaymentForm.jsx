import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initiatePayment } from './paymentSlice';

const PaymentForm = () => {
  const dispatch = useDispatch();
  const { paymentStatus, loading, error } = useSelector((state) => state.payment);
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(initiatePayment({ amount }));
  };

  return (
    <div className="payment-form">
      <h2>Payment</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>Pay</button>
      </form>
      {paymentStatus && <div className="success">Payment {paymentStatus.status}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default PaymentForm;
