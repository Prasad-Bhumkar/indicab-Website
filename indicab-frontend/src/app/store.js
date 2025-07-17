import { configureStore } from '@reduxjs/toolkit';
import serviceCitiesReducer from '../features/serviceCities/serviceCitiesSlice';
import popularRoutesReducer from '../features/popularRoutes/popularRoutesSlice';
import recommendationsReducer from '../features/recommendations/recommendationsSlice';
import bookingConfirmationModalReducer from '../features/bookingConfirmationModal/bookingConfirmationModalSlice';
import appSectionReducer from '../features/appSection/appSectionSlice';
import bookingHistoryReducer from '../features/bookingHistory/bookingHistorySlice';
import mockRoutesReducer from '../features/mockRoutes/mockRoutesSlice';

export const store = configureStore({
  reducer: {
    serviceCities: serviceCitiesReducer,
    popularRoutes: popularRoutesReducer,
    recommendations: recommendationsReducer,
    bookingConfirmationModal: bookingConfirmationModalReducer,
    appSection: appSectionReducer,
    bookingHistory: bookingHistoryReducer,
    mockRoutes: mockRoutesReducer,
  },
});
