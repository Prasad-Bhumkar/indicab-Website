import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../config/apiConfig';

export const createPaymentIntent = createAsyncThunk(
  'payment/createPaymentIntent',
  async ({ amount, currency = 'INR' }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/api/payment/intent', {
        params: { amount, currency },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const initiatePayment = createAsyncThunk(
  'payment/initiatePayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/payment', paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPaymentStatus = createAsyncThunk(
  'payment/fetchPaymentStatus',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/api/payment/${paymentId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Razorpay thunks for Indian payments (UPI, Cards, Net Banking, Wallets)
export const createRazorpayOrder = createAsyncThunk(
  'payment/createRazorpayOrder',
  async ({ bookingId, amount, currency = 'INR', paymentMethod = 'upi' }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/razorpay/create-order', null, {
        params: { bookingId, amount, currency, paymentMethod },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create Razorpay order');
    }
  }
);

export const verifyRazorpayPayment = createAsyncThunk(
  'payment/verifyRazorpayPayment',
  async (verificationData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/razorpay/verify-payment', verificationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment verification failed');
    }
  }
);

const initialState = {
  paymentIntent: null,
  paymentStatus: null,
  razorpayOrder: null,
  loading: false,
  error: null,
  successMessage: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Payment Intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentIntent = action.payload;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create payment intent';
      })
      // Initiate Payment
      .addCase(initiatePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentStatus = action.payload;
        state.successMessage = 'Payment initiated successfully';
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Payment initiation failed';
      })
      // Fetch Payment Status
      .addCase(fetchPaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentStatus = action.payload;
      })
      .addCase(fetchPaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch payment status';
      })
      // Create Razorpay Order
      .addCase(createRazorpayOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.razorpayOrder = action.payload;
      })
      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify Razorpay Payment
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.successMessage = 'Payment verified successfully';
          state.paymentStatus = { status: 'succeeded', paymentId: action.payload.paymentId };
        } else {
          state.error = action.payload.message;
        }
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentError, clearSuccessMessage } = paymentSlice.actions;
export default paymentSlice.reducer;
