import axios from 'axios';

export const initiatePaymentApi = (paymentData) => axios.post('/api/payment', paymentData);
