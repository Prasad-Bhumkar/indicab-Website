import { createSlice } from '@reduxjs/toolkit';

const bookingConfirmationModalSlice = createSlice({
  name: 'bookingConfirmationModal',
  initialState: {
    isOpen: false,
    bookingDetails: null,
  },
  reducers: {
    openBookingConfirmationModal: (state, action) => {
      state.isOpen = true;
      state.bookingDetails = action.payload;
    },
    closeBookingConfirmationModal: (state) => {
      state.isOpen = false;
      state.bookingDetails = null;
    },
  },
});

export const { openBookingConfirmationModal, closeBookingConfirmationModal } = bookingConfirmationModalSlice.actions;

export default bookingConfirmationModalSlice.reducer;
