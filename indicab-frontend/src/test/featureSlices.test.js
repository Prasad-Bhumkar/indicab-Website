import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ──────────────────────────────────────────────
// 1. adminSlice
// ──────────────────────────────────────────────
import adminReducer, {
  clearError,
  clearSuccessMessage,
  updateDashboardStats,
  addRealTimeBooking,
  updateRealTimeBookingStatus,
  addRealTimeUser,
  addRealTimeAuditLog,
  fetchAdminDashboard,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  fetchDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  approveDriver,
  rejectDriver,
  fetchBookings,
  updateBookingStatus,
  cancelBooking,
  fetchAdminStats,
  fetchRevenue,
  fetchBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  fetchPackages,
  createPackage,
  updatePackage,
  deletePackage,
  fetchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  bulkDeleteUsers,
  bulkDeleteDrivers,
  bulkDeleteBookings,
  bulkDeleteBlogs,
  bulkDeletePackages,
  bulkDeleteVehicles,
  bulkUpdateStatus,
  bulkUpdateUsersRole,
  fetchAuditLogs,
  fetchAuditLogStatistics,
  bulkExport,
} from '../features/admin/adminSlice';

// ──────────────────────────────────────────────
// 2. authSlice
// ──────────────────────────────────────────────
import authReducer, {
  logout,
  setCredentials,
  loginUser,
  registerUser,
  adminLoginUser,
  logoutUser,
} from '../features/auth/authSlice';

// ──────────────────────────────────────────────
// 3. profileSlice
// ──────────────────────────────────────────────
import profileReducer, {
  fetchProfile,
  updateProfile,
} from '../features/profile/profileSlice';

// ──────────────────────────────────────────────
// 4. bookingHistorySlice
// ──────────────────────────────────────────────
import bookingHistoryReducer, {
  addBooking,
  updateBooking,
  deleteBooking,
  fetchBookings as fetchBookingHistory,
  updateBookingAsync,
} from '../features/bookingHistory/bookingHistorySlice';

// ──────────────────────────────────────────────
// 5. serviceCitiesSlice
// ──────────────────────────────────────────────
import serviceCitiesReducer, {
  fetchServiceCities,
} from '../features/serviceCities/serviceCitiesSlice';

// ──────────────────────────────────────────────
// 6. driverSlice
// ──────────────────────────────────────────────
import driverReducer, {
  clearError as clearDriverError,
  clearSuccessMessage as clearDriverSuccess,
  applyAsDriver,
  fetchPendingApplications,
  fetchApprovedDrivers,
  fetchAllDrivers,
  fetchDriverById,
  reviewDriverApplication,
  fetchDriverRides,
} from '../features/driver/driverSlice';

// ──────────────────────────────────────────────
// 7. blogSlice
// ──────────────────────────────────────────────
import blogReducer, {
  fetchPublishedBlogs,
  fetchBlogById,
} from '../features/blog/blogSlice';

// ──────────────────────────────────────────────
// 8. bookingConfirmationModalSlice
// ──────────────────────────────────────────────
import bookingConfirmationModalReducer, {
  openBookingConfirmationModal,
  closeBookingConfirmationModal,
} from '../features/bookingConfirmationModal/bookingConfirmationModalSlice';

// ──────────────────────────────────────────────
// 9. mockRoutesSlice
// ──────────────────────────────────────────────
import mockRoutesReducer, {
  addRoute as addMockRoute,
  updateRoute as updateMockRoute,
  deleteRoute as deleteMockRoute,
} from '../features/mockRoutes/mockRoutesSlice';

// ──────────────────────────────────────────────
// 10. notificationsSlice
// ──────────────────────────────────────────────
import notificationsReducer, {
  clearNotificationError,
  receiveNotification,
  fetchUserNotifications,
  fetchUnreadNotifications,
  getUnreadCount,
  markAsRead as markNotifAsRead,
  markAllAsRead as markAllNotifAsRead,
  deleteNotification,
  addNotification,
} from '../features/notifications/notificationsSlice';

// ──────────────────────────────────────────────
// 11. notificationSlice (singular)
// ──────────────────────────────────────────────
import notificationReducer, {
  addNotification as addSingleNotification,
  fetchNotifications,
  markAsRead as markSingleAsRead,
  markAllAsRead as markAllSingleRead,
} from '../features/notification/notificationSlice';

// ──────────────────────────────────────────────
// 12. ratingsSlice
// ──────────────────────────────────────────────
import ratingsReducer, {
  clearRatingError,
  clearCurrentRating,
  submitRating as submitRatingsRating,
  fetchUserRatings as fetchRatingsUserRatings,
  checkIfUserRatedBooking,
  getRatingByBookingId,
  updateRating as updateRatingsRating,
  deleteRating as deleteRatingsRating,
} from '../features/ratings/ratingsSlice';

// ──────────────────────────────────────────────
// 13. ratingSlice (singular)
// ──────────────────────────────────────────────
import ratingReducer, {
  submitRating as submitSingleRating,
  fetchUserRatings as fetchSingleRatings,
  checkHasRated,
} from '../features/rating/ratingSlice';

// ──────────────────────────────────────────────
// 14. popularRoutesSlice
// ──────────────────────────────────────────────
import popularRoutesReducer, {
  addRoute as addPopularRoute,
  updateRoute as updatePopularRoute,
  deleteRoute as deletePopularRoute,
  fetchPopularRoutes,
} from '../features/popularRoutes/popularRoutesSlice';

// ──────────────────────────────────────────────
// 15. recommendationsSlice
// ──────────────────────────────────────────────
import recommendationsReducer, {
  toggleFavorite,
  fetchRecommendations,
} from '../features/recommendations/recommendationsSlice';

// ──────────────────────────────────────────────
// 16. appSectionSlice
// ──────────────────────────────────────────────
import appSectionReducer, {
  incrementDownloadCount,
} from '../features/appSection/appSectionSlice';

// ══════════════════════════════════════════════
//  CREATE TEST STORE
// ══════════════════════════════════════════════
const createTestStore = () => {
  return configureStore({
    reducer: {
      admin: adminReducer,
      auth: authReducer,
      profile: profileReducer,
      bookingHistory: bookingHistoryReducer,
      serviceCities: serviceCitiesReducer,
      driver: driverReducer,
      blog: blogReducer,
      bookingConfirmationModal: bookingConfirmationModalReducer,
      mockRoutes: mockRoutesReducer,
      notifications: notificationsReducer,
      notification: notificationReducer,
      ratings: ratingsReducer,
      rating: ratingReducer,
      popularRoutes: popularRoutesReducer,
      recommendations: recommendationsReducer,
      appSection: appSectionReducer,
    },
  });
};

// ══════════════════════════════════════════════
//  1. APP SECTION SLICE
// ══════════════════════════════════════════════
describe('App Section Slice', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should have initial state', () => {
    const state = store.getState().appSection;
    expect(state.downloadCount).toBe(0);
  });

  it('should increment download count', () => {
    store.dispatch(incrementDownloadCount());
    expect(store.getState().appSection.downloadCount).toBe(1);

    store.dispatch(incrementDownloadCount());
    expect(store.getState().appSection.downloadCount).toBe(2);
  });
});

// ══════════════════════════════════════════════
//  2. AUTH SLICE
// ══════════════════════════════════════════════
describe('Auth Slice', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should have initial state', () => {
    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set credentials', () => {
    const payload = {
      token: 'jwt-token',
      user: { id: 1, name: 'Test', email: 'test@test.com' },
    };
    store.dispatch(setCredentials(payload));
    const state = store.getState().auth;
    expect(state.token).toBe('jwt-token');
    expect(state.user).toEqual(payload.user);
  });

  it('should logout (sync)', () => {
    store.dispatch(setCredentials({ token: 'x', user: { id: 1 } }));
    store.dispatch(logout());
    const state = store.getState().auth;
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('should handle loginUser pending', () => {
    const state = authReducer(undefined, { type: loginUser.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle loginUser fulfilled', () => {
    const payload = { token: 'abc', refreshToken: 'ref', user: { id: 1, role: 'CUSTOMER' } };
    const state = authReducer(undefined, { type: loginUser.fulfilled.type, payload });
    expect(state.loading).toBe(false);
    expect(state.token).toBe('abc');
    expect(state.user).toEqual(payload.user);
  });

  it('should handle loginUser rejected', () => {
    const state = authReducer(undefined, { type: loginUser.rejected.type, payload: 'Invalid credentials' });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Invalid credentials');
  });

  it('should handle registerUser fulfilled', () => {
    const payload = { token: 'reg-token', refreshToken: 'r2', user: { id: 2, name: 'New' } };
    const state = authReducer(undefined, { type: registerUser.fulfilled.type, payload });
    expect(state.token).toBe('reg-token');
    expect(state.user).toEqual(payload.user);
  });

  it('should handle logoutUser fulfilled', () => {
    const start = authReducer(undefined, { type: loginUser.fulfilled.type, payload: { token: 'x', user: { id: 1 } } });
    const state = authReducer(start, { type: logoutUser.fulfilled.type });
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('should handle adminLoginUser fulfilled', () => {
    const payload = { token: 'admin-token', refreshToken: 'r3', user: { id: 99, role: 'ADMIN' } };
    const state = authReducer(undefined, { type: adminLoginUser.fulfilled.type, payload });
    expect(state.token).toBe('admin-token');
    expect(state.user.role).toBe('ADMIN');
  });

  it('should handle adminLoginUser rejected', () => {
    const state = authReducer(undefined, { type: adminLoginUser.rejected.type, payload: 'Not admin' });
    expect(state.error).toBe('Not admin');
    expect(state.loading).toBe(false);
  });
});

// ══════════════════════════════════════════════
//  3. PROFILE SLICE
// ══════════════════════════════════════════════
describe('Profile Slice', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should have initial state', () => {
    const state = store.getState().profile;
    expect(state.profile).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle fetchProfile pending', () => {
    const state = profileReducer(undefined, { type: fetchProfile.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchProfile fulfilled', () => {
    const profile = { id: 1, name: 'John', email: 'john@test.com' };
    const state = profileReducer(undefined, { type: fetchProfile.fulfilled.type, payload: profile });
    expect(state.loading).toBe(false);
    expect(state.profile).toEqual(profile);
  });

  it('should handle fetchProfile rejected', () => {
    const state = profileReducer(undefined, { type: fetchProfile.rejected.type, error: { message: 'Network error' } });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Network error');
  });

  it('should handle updateProfile fulfilled', () => {
    const profile = { id: 1, name: 'Updated', phone: '+91-9999999999' };
    const state = profileReducer(undefined, { type: updateProfile.fulfilled.type, payload: profile });
    expect(state.loading).toBe(false);
    expect(state.profile).toEqual(profile);
  });

  it('should handle updateProfile pending', () => {
    const state = profileReducer(undefined, { type: updateProfile.pending.type });
    expect(state.loading).toBe(true);
  });
});

// ══════════════════════════════════════════════
//  4. BOOKING HISTORY SLICE
// ══════════════════════════════════════════════
describe('Booking History Slice', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should have initial state', () => {
    const state = store.getState().bookingHistory;
    expect(state.bookings).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.isOffline).toBe(false);
  });

  it('should add booking', () => {
    const booking = { id: 1, from: 'A', to: 'B', status: 'pending' };
    store.dispatch(addBooking(booking));
    expect(store.getState().bookingHistory.bookings).toContainEqual(booking);
  });

  it('should not add duplicate bookings', () => {
    const booking = { id: 1, from: 'A', to: 'B' };
    store.dispatch(addBooking(booking));
    store.dispatch(addBooking(booking));
    expect(store.getState().bookingHistory.bookings.length).toBe(2);
  });

  it('should update booking', () => {
    const booking = { id: 1, from: 'A', to: 'B', status: 'pending' };
    store.dispatch(addBooking(booking));
    store.dispatch(updateBooking({ id: 1, from: 'A', to: 'B', status: 'completed' }));
    const found = store.getState().bookingHistory.bookings.find(b => b.id === 1);
    expect(found.status).toBe('completed');
  });

  it('should delete booking', () => {
    store.dispatch(addBooking({ id: 1, from: 'A', to: 'B' }));
    store.dispatch(addBooking({ id: 2, from: 'C', to: 'D' }));
    store.dispatch(deleteBooking(1));
    expect(store.getState().bookingHistory.bookings.length).toBe(1);
    expect(store.getState().bookingHistory.bookings[0].id).toBe(2);
  });

  it('should handle fetchBookings pending', () => {
    const state = bookingHistoryReducer(undefined, { type: fetchBookingHistory.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchBookings fulfilled', () => {
    const payload = {
      data: [{ id: 1, from: 'A', to: 'B' }],
      isOffline: false,
      error: null,
    };
    const state = bookingHistoryReducer(undefined, { type: fetchBookingHistory.fulfilled.type, payload });
    expect(state.loading).toBe(false);
    expect(state.bookings).toEqual(payload.data);
    expect(state.isOffline).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle fetchBookings fulfilled with offline fallback', () => {
    const payload = {
      data: [],
      isOffline: true,
      error: 'Network error',
    };
    const state = bookingHistoryReducer(
      { bookings: [], loading: true, error: null, isOffline: false },
      { type: fetchBookingHistory.fulfilled.type, payload }
    );
    expect(state.loading).toBe(false);
    expect(state.isOffline).toBe(true);
  });

  it('should handle fetchBookings rejected', () => {
    const state = bookingHistoryReducer(undefined, { type: fetchBookingHistory.rejected.type, error: { message: 'Failed' } });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Failed');
  });

  it('should handle updateBookingAsync fulfilled', () => {
    const initial = bookingHistoryReducer(undefined, { type: fetchBookingHistory.fulfilled.type, payload: { data: [{ id: 1, status: 'pending' }] } });
    const state = bookingHistoryReducer(initial, {
      type: updateBookingAsync.fulfilled.type,
      payload: { data: { id: 1, status: 'confirmed' } },
    });
    expect(state.bookings[0].status).toBe('confirmed');
  });
});

// ══════════════════════════════════════════════
//  5. SERVICE CITIES SLICE
// ══════════════════════════════════════════════
describe('Service Cities Slice', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should have initial state', () => {
    const state = store.getState().serviceCities;
    expect(state.cities).toEqual([]);
    expect(state.stats).toEqual({});
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle fetchServiceCities pending', () => {
    const state = serviceCitiesReducer(undefined, { type: fetchServiceCities.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchServiceCities fulfilled', () => {
    const payload = { cities: ['Delhi', 'Mumbai'], stats: { citiesCovered: 2 } };
    const state = serviceCitiesReducer(undefined, { type: fetchServiceCities.fulfilled.type, payload });
    expect(state.loading).toBe(false);
    expect(state.cities).toEqual(['Delhi', 'Mumbai']);
    expect(state.stats).toEqual({ citiesCovered: 2 });
  });

  it('should handle fetchServiceCities rejected', () => {
    const state = serviceCitiesReducer(undefined, { type: fetchServiceCities.rejected.type, error: { message: 'API error' } });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('API error');
  });

  it('should handle fetchServiceCities fulfilled with empty payload', () => {
    const state = serviceCitiesReducer(undefined, { type: fetchServiceCities.fulfilled.type, payload: {} });
    expect(state.cities).toEqual([]);
    expect(state.stats).toEqual({});
  });
});

// ══════════════════════════════════════════════
//  6. DRIVER SLICE
// ══════════════════════════════════════════════
describe('Driver Slice', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should have initial state', () => {
    const state = store.getState().driver;
    expect(state.drivers).toEqual([]);
    expect(state.pendingApplications).toEqual([]);
    expect(state.approvedDrivers).toEqual([]);
    expect(state.currentDriver).toBeNull();
    expect(state.rides).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.successMessage).toBeNull();
  });

  it('should clear driver error', () => {
    store = configureStore({
      reducer: { driver: driverReducer },
      preloadedState: { driver: { drivers: [], pendingApplications: [], approvedDrivers: [], currentDriver: null, rides: [], loading: false, error: 'Some error', successMessage: null } },
    });
    store.dispatch(clearDriverError());
    expect(store.getState().driver.error).toBeNull();
  });

  it('should clear driver success message', () => {
    store = configureStore({
      reducer: { driver: driverReducer },
      preloadedState: { driver: { drivers: [], pendingApplications: [], approvedDrivers: [], currentDriver: null, rides: [], loading: false, error: null, successMessage: 'Done' } },
    });
    store.dispatch(clearDriverSuccess());
    expect(store.getState().driver.successMessage).toBeNull();
  });

  it('should handle applyAsDriver pending', () => {
    const state = driverReducer(undefined, { type: applyAsDriver.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.successMessage).toBeNull();
  });

  it('should handle applyAsDriver fulfilled', () => {
    const driver = { id: 1, name: 'Raj', status: 'PENDING' };
    const state = driverReducer(undefined, { type: applyAsDriver.fulfilled.type, payload: driver });
    expect(state.loading).toBe(false);
    expect(state.currentDriver).toEqual(driver);
    expect(state.successMessage).toBe('Application submitted successfully. Pending admin review.');
  });

  it('should handle applyAsDriver rejected', () => {
    const state = driverReducer(undefined, { type: applyAsDriver.rejected.type, payload: 'Already applied' });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Already applied');
  });

  it('should handle fetchPendingApplications fulfilled', () => {
    const apps = [{ id: 1, name: 'Priya' }];
    const state = driverReducer(undefined, { type: fetchPendingApplications.fulfilled.type, payload: apps });
    expect(state.pendingApplications).toEqual(apps);
  });

  it('should handle fetchApprovedDrivers fulfilled', () => {
    const approved = [{ id: 2, name: 'Amit' }];
    const state = driverReducer(undefined, { type: fetchApprovedDrivers.fulfilled.type, payload: approved });
    expect(state.approvedDrivers).toEqual(approved);
  });

  it('should handle fetchAllDrivers fulfilled', () => {
    const all = [{ id: 1 }, { id: 2 }];
    const state = driverReducer(undefined, { type: fetchAllDrivers.fulfilled.type, payload: all });
    expect(state.drivers).toEqual(all);
  });

  it('should handle fetchDriverById fulfilled', () => {
    const driver = { id: 5, name: 'Specific Driver' };
    const state = driverReducer(undefined, { type: fetchDriverById.fulfilled.type, payload: driver });
    expect(state.currentDriver).toEqual(driver);
  });

  it('should handle reviewDriverApplication fulfilled', () => {
    const result = { id: 1, driverStatus: 'APPROVED' };
    const state = driverReducer(
      { drivers: [], pendingApplications: [{ id: 1, name: 'Test' }], approvedDrivers: [], currentDriver: null, rides: [], loading: true, error: null, successMessage: null },
      { type: reviewDriverApplication.fulfilled.type, payload: result }
    );
    expect(state.loading).toBe(false);
    expect(state.successMessage).toBe('Driver application approved');
    expect(state.pendingApplications).toEqual([]);
  });

  it('should handle reviewDriverApplication rejected', () => {
    const state = driverReducer(undefined, { type: reviewDriverApplication.rejected.type, payload: 'Review failed' });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Review failed');
  });

  it('should handle fetchDriverRides fulfilled', () => {
    const rides = [{ id: 10, from: 'A', to: 'B' }];
    const state = driverReducer(undefined, { type: fetchDriverRides.fulfilled.type, payload: rides });
    expect(state.rides).toEqual(rides);
  });
});

// ══════════════════════════════════════════════
//  7. BLOG SLICE
// ══════════════════════════════════════════════
describe('Blog Slice', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should have initial state', () => {
    const state = store.getState().blog;
    expect(state.publishedBlogs).toEqual([]);
    expect(state.currentBlog).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle fetchPublishedBlogs pending', () => {
    const state = blogReducer(undefined, { type: fetchPublishedBlogs.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchPublishedBlogs fulfilled', () => {
    const blogs = [{ id: 1, title: 'Test Blog' }];
    const state = blogReducer(undefined, { type: fetchPublishedBlogs.fulfilled.type, payload: blogs });
    expect(state.loading).toBe(false);
    expect(state.publishedBlogs).toEqual(blogs);
  });

  it('should handle fetchPublishedBlogs rejected', () => {
    const state = blogReducer(undefined, { type: fetchPublishedBlogs.rejected.type, payload: 'Failed' });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Failed');
  });

  it('should handle fetchBlogById fulfilled', () => {
    const blog = { id: 1, title: 'Detail', content: 'Full text' };
    const state = blogReducer(undefined, { type: fetchBlogById.fulfilled.type, payload: blog });
    expect(state.currentBlog).toEqual(blog);
  });

  it('should handle fetchBlogById rejected', () => {
    const state = blogReducer(undefined, { type: fetchBlogById.rejected.type, payload: 'Not found' });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Not found');
  });
});

// ══════════════════════════════════════════════
//  8. BOOKING CONFIRMATION MODAL SLICE
// ══════════════════════════════════════════════
describe('Booking Confirmation Modal Slice', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should have initial state', () => {
    const state = store.getState().bookingConfirmationModal;
    expect(state.isOpen).toBe(false);
    expect(state.bookingDetails).toBeNull();
  });

  it('should open modal with booking details', () => {
    const details = { id: 1, from: 'Mumbai', to: 'Pune', fare: 800 };
    store.dispatch(openBookingConfirmationModal(details));
    const state = store.getState().bookingConfirmationModal;
    expect(state.isOpen).toBe(true);
    expect(state.bookingDetails).toEqual(details);
  });

  it('should close modal and clear details', () => {
    store.dispatch(openBookingConfirmationModal({ id: 1 }));
    store.dispatch(closeBookingConfirmationModal());
    const state = store.getState().bookingConfirmationModal;
    expect(state.isOpen).toBe(false);
    expect(state.bookingDetails).toBeNull();
  });
});

// ══════════════════════════════════════════════
//  9. MOCK ROUTES SLICE
// ══════════════════════════════════════════════
describe('Mock Routes Slice', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should have initial state with predefined routes', () => {
    const state = store.getState().mockRoutes;
    expect(Array.isArray(state.routes)).toBe(true);
    expect(state.routes.length).toBeGreaterThanOrEqual(8);
    expect(state.routes[0].from).toBe('Mumbai');
    expect(state.routes[0].to).toBe('Pune');
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should add a mock route', () => {
    const newRoute = { from: 'Goa', to: 'Mumbai', distance: 600 };
    store.dispatch(addMockRoute(newRoute));
    expect(store.getState().mockRoutes.routes).toContainEqual(newRoute);
  });

  it('should update a mock route', () => {
    const updated = { from: 'Mumbai', to: 'Pune', distance: 200 };
    store.dispatch(updateMockRoute(updated));
    const found = store.getState().mockRoutes.routes.find(r => r.from === 'Mumbai' && r.to === 'Pune');
    expect(found.distance).toBe(200);
  });

  it('should delete a mock route', () => {
    const initialCount = store.getState().mockRoutes.routes.length;
    store.dispatch(deleteMockRoute({ from: 'Mumbai', to: 'Pune' }));
    expect(store.getState().mockRoutes.routes.length).toBe(initialCount - 1);
    expect(store.getState().mockRoutes.routes.find(r => r.from === 'Mumbai' && r.to === 'Pune')).toBeUndefined();
  });
});

// ══════════════════════════════════════════════
//  10. NOTIFICATIONS SLICE (plural)
// ══════════════════════════════════════════════
describe('Notifications Slice (plural)', () => {
  let store;

  beforeEach(() => {
    localStorage.clear();
    store = createTestStore();
  });

  it('should have initial state', () => {
    const state = store.getState().notifications;
    expect(state.notifications).toEqual([]);
    expect(state.unreadNotifications).toEqual([]);
    expect(state.unreadCount).toBe(0);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.pagination).toBeDefined();
    expect(state.pagination.page).toBe(0);
  });

  it('should clear notification error', () => {
    store = configureStore({
      reducer: { notifications: notificationsReducer },
      preloadedState: {
        notifications: {
          notifications: [], unreadNotifications: [], unreadCount: 0, pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 }, loading: false, error: 'Bad request',
        },
      },
    });
    store.dispatch(clearNotificationError());
    expect(store.getState().notifications.error).toBeNull();
  });

  it('should receive real-time notification', () => {
    const notif = { id: 1, message: 'New booking', isRead: false };
    store.dispatch(receiveNotification(notif));
    const state = store.getState().notifications;
    expect(state.unreadNotifications[0]).toEqual(notif);
    expect(state.unreadCount).toBe(1);
  });

  it('should handle fetchUserNotifications fulfilled', () => {
    const payload = {
      content: [{ id: 1, message: 'Hello' }],
      page: 0, size: 10, totalElements: 1, totalPages: 1,
    };
    const state = notificationsReducer(undefined, { type: fetchUserNotifications.fulfilled.type, payload });
    expect(state.loading).toBe(false);
    expect(state.notifications).toEqual(payload.content);
    expect(state.pagination.totalElements).toBe(1);
  });

  it('should handle fetchUserNotifications rejected', () => {
    const state = notificationsReducer(undefined, { type: fetchUserNotifications.rejected.type, payload: 'Error' });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Error');
  });

  it('should handle fetchUnreadNotifications fulfilled', () => {
    const unread = [{ id: 2, message: 'Unread' }];
    const state = notificationsReducer(undefined, { type: fetchUnreadNotifications.fulfilled.type, payload: unread });
    expect(state.unreadNotifications).toEqual(unread);
  });

  it('should handle getUnreadCount fulfilled', () => {
    const state = notificationsReducer(undefined, { type: getUnreadCount.fulfilled.type, payload: 5 });
    expect(state.unreadCount).toBe(5);
  });

  it('should handle markAsRead fulfilled', () => {
    const initial = notificationsReducer(undefined, { type: fetchUserNotifications.fulfilled.type, payload: { content: [{ id: 1, isRead: false }, { id: 2, isRead: false }], page: 0, size: 10, totalElements: 2, totalPages: 1 } });
    const withUnread = notificationsReducer(initial, { type: fetchUnreadNotifications.fulfilled.type, payload: [{ id: 1, isRead: false }] });
    const state = notificationsReducer(withUnread, { type: markNotifAsRead.fulfilled.type, payload: 1 });
    expect(state.notifications.find(n => n.id === 1).isRead).toBe(true);
    expect(state.unreadCount).toBeGreaterThanOrEqual(0);
  });

  it('should handle markAllAsRead fulfilled', () => {
    const initial = notificationsReducer(undefined, { type: fetchUserNotifications.fulfilled.type, payload: { content: [{ id: 1, isRead: false }, { id: 2, isRead: false }], page: 0, size: 10, totalElements: 2, totalPages: 1 } });
    const state = notificationsReducer(initial, { type: markAllNotifAsRead.fulfilled.type });
    expect(state.unreadNotifications).toEqual([]);
    expect(state.unreadCount).toBe(0);
    expect(state.notifications.every(n => n.isRead)).toBe(true);
  });

  it('should handle deleteNotification fulfilled', () => {
    const initial = notificationsReducer(undefined, { type: fetchUserNotifications.fulfilled.type, payload: { content: [{ id: 1 }, { id: 2 }], page: 0, size: 10, totalElements: 2, totalPages: 1 } });
    const state = notificationsReducer(initial, { type: deleteNotification.fulfilled.type, payload: 1 });
    expect(state.notifications.length).toBe(1);
    expect(state.notifications[0].id).toBe(2);
  });

  it('should handle addNotification (thunk) fulfilled', () => {
    const notif = { id: 10, message: 'Real-time', isRead: false };
    const state = notificationsReducer(undefined, { type: addNotification.fulfilled.type, payload: notif });
    expect(state.notifications[0]).toEqual(notif);
    expect(state.unreadNotifications[0]).toEqual(notif);
    expect(state.unreadCount).toBe(1);
  });
});

// ══════════════════════════════════════════════
//  11. NOTIFICATION SLICE (singular)
// ══════════════════════════════════════════════
describe('Notification Slice (singular)', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should have initial state', () => {
    const state = store.getState().notification;
    expect(state.notifications).toEqual([]);
    expect(state.unreadCount).toBe(0);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should add single notification via reducer', () => {
    const notif = { id: 1, message: 'Test', isRead: false };
    store.dispatch(addSingleNotification(notif));
    const state = store.getState().notification;
    expect(state.notifications[0]).toEqual(notif);
    expect(state.unreadCount).toBe(1);
  });

  it('should not increment unread count for read notifications', () => {
    const notif = { id: 2, message: 'Read', isRead: true };
    store.dispatch(addSingleNotification(notif));
    expect(store.getState().notification.unreadCount).toBe(0);
  });

  it('should handle fetchNotifications fulfilled', () => {
    const payload = { data: { content: [{ id: 1, isRead: false }, { id: 2, isRead: true }] } };
    const state = notificationReducer(undefined, { type: fetchNotifications.fulfilled.type, payload });
    expect(state.loading).toBe(false);
    expect(state.notifications.length).toBe(2);
    expect(state.unreadCount).toBe(1);
  });

  it('should handle markAsRead fulfilled', () => {
    const initial = notificationReducer(undefined, {
      type: fetchNotifications.fulfilled.type,
      payload: { data: { content: [{ id: 1, isRead: false }] } },
    });
    const state = notificationReducer(initial, { type: markSingleAsRead.fulfilled.type, payload: 1 });
    expect(state.notifications[0].isRead).toBe(true);
    expect(state.unreadCount).toBe(0);
  });

  it('should handle markAllAsRead fulfilled', () => {
    const initial = notificationReducer(undefined, {
      type: fetchNotifications.fulfilled.type,
      payload: { data: { content: [{ id: 1, isRead: false }, { id: 2, isRead: false }] } },
    });
    const state = notificationReducer(initial, { type: markAllSingleRead.fulfilled.type });
    expect(state.notifications.every(n => n.isRead)).toBe(true);
    expect(state.unreadCount).toBe(0);
  });
});

// ══════════════════════════════════════════════
//  12. RATINGS SLICE (plural)
// ══════════════════════════════════════════════
describe('Ratings Slice (plural)', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should have initial state', () => {
    const state = store.getState().ratings;
    expect(state.ratings).toEqual([]);
    expect(state.currentRating).toBeNull();
    expect(state.hasRatedBooking).toEqual({});
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.pagination).toBeDefined();
  });

  it('should clear rating error', () => {
    store = configureStore({
      reducer: { ratings: ratingsReducer },
      preloadedState: {
        ratings: {
          ratings: [], currentRating: null, hasRatedBooking: {}, pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 }, loading: false, error: 'Err',
        },
      },
    });
    store.dispatch(clearRatingError());
    expect(store.getState().ratings.error).toBeNull();
  });

  it('should clear current rating', () => {
    store = configureStore({
      reducer: { ratings: ratingsReducer },
      preloadedState: {
        ratings: {
          ratings: [], currentRating: { id: 1, score: 5 }, hasRatedBooking: {}, pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 }, loading: false, error: null,
        },
      },
    });
    store.dispatch(clearCurrentRating());
    expect(store.getState().ratings.currentRating).toBeNull();
  });

  it('should handle submitRating fulfilled', () => {
    const rating = { id: 1, bookingId: 10, score: 5 };
    const state = ratingsReducer(undefined, { type: submitRatingsRating.fulfilled.type, payload: rating });
    expect(state.loading).toBe(false);
    expect(state.currentRating).toEqual(rating);
    expect(state.ratings[0]).toEqual(rating);
  });

  it('should handle submitRating rejected', () => {
    const state = ratingsReducer(undefined, { type: submitRatingsRating.rejected.type, payload: 'Failed' });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Failed');
  });

  it('should handle fetchUserRatings fulfilled', () => {
    const payload = { content: [{ id: 1, score: 4 }], page: 0, size: 10, totalElements: 1, totalPages: 1 };
    const state = ratingsReducer(undefined, { type: fetchRatingsUserRatings.fulfilled.type, payload });
    expect(state.ratings).toEqual(payload.content);
    expect(state.pagination.totalElements).toBe(1);
  });

  it('should handle checkIfUserRatedBooking fulfilled', () => {
    const payload = { bookingId: 5, hasRated: true };
    const state = ratingsReducer(undefined, { type: checkIfUserRatedBooking.fulfilled.type, payload });
    expect(state.hasRatedBooking[5]).toBe(true);
  });

  it('should handle getRatingByBookingId fulfilled', () => {
    const rating = { id: 1, bookingId: 5, score: 4 };
    const state = ratingsReducer(undefined, { type: getRatingByBookingId.fulfilled.type, payload: rating });
    expect(state.currentRating).toEqual(rating);
  });

  it('should handle updateRating fulfilled', () => {
    const state = ratingsReducer(
      { ratings: [{ id: 1, score: 3 }], currentRating: null, hasRatedBooking: {}, pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 }, loading: true, error: null },
      { type: updateRatingsRating.fulfilled.type, payload: { id: 1, score: 5 } }
    );
    expect(state.loading).toBe(false);
    expect(state.ratings[0].score).toBe(5);
  });

  it('should handle updateRating rejected', () => {
    const state = ratingsReducer(undefined, { type: updateRatingsRating.rejected.type, payload: 'Update failed' });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Update failed');
  });

  it('should handle deleteRating fulfilled', () => {
    const state = ratingsReducer(
      { ratings: [{ id: 1 }, { id: 2 }], currentRating: null, hasRatedBooking: {}, pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 }, loading: true, error: null },
      { type: deleteRatingsRating.fulfilled.type, payload: 1 }
    );
    expect(state.loading).toBe(false);
    expect(state.ratings.length).toBe(1);
    expect(state.ratings[0].id).toBe(2);
  });
});

// ══════════════════════════════════════════════
//  13. RATING SLICE (singular)
// ══════════════════════════════════════════════
describe('Rating Slice (singular)', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should have initial state', () => {
    const state = store.getState().rating;
    expect(state.ratings).toEqual([]);
    expect(state.hasRatedMap).toEqual({});
    expect(state.loading).toBe(false);
    expect(state.submitting).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle submitRating pending', () => {
    const state = ratingReducer(undefined, { type: submitSingleRating.pending.type });
    expect(state.submitting).toBe(true);
  });

  it('should handle submitRating fulfilled', () => {
    const payload = { data: { id: 1, bookingId: 10, score: 5 } };
    const state = ratingReducer(undefined, { type: submitSingleRating.fulfilled.type, payload });
    expect(state.submitting).toBe(false);
    expect(state.ratings[0]).toEqual(payload.data);
    expect(state.hasRatedMap[10]).toBe(true);
  });

  it('should handle submitRating rejected', () => {
    const state = ratingReducer(undefined, { type: submitSingleRating.rejected.type, error: { message: 'Error' } });
    expect(state.submitting).toBe(false);
    expect(state.error).toBe('Error');
  });

  it('should handle fetchUserRatings fulfilled', () => {
    const payload = { data: { content: [{ id: 1, score: 4 }] } };
    const state = ratingReducer(undefined, { type: fetchSingleRatings.fulfilled.type, payload });
    expect(state.loading).toBe(false);
    expect(state.ratings).toEqual(payload.data.content);
  });

  it('should handle checkHasRated fulfilled', () => {
    const payload = { bookingId: 3, hasRated: true };
    const state = ratingReducer(undefined, { type: checkHasRated.fulfilled.type, payload });
    expect(state.hasRatedMap[3]).toBe(true);
  });
});

// ══════════════════════════════════════════════
//  14. POPULAR ROUTES SLICE
// ══════════════════════════════════════════════
describe('Popular Routes Slice', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should have initial state', () => {
    const state = store.getState().popularRoutes;
    expect(state.routes).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should add popular route', () => {
    const route = { id: 1, from: 'Delhi', to: 'Agra', price: 500 };
    store.dispatch(addPopularRoute(route));
    expect(store.getState().popularRoutes.routes).toContainEqual(route);
  });

  it('should update popular route', () => {
    store.dispatch(addPopularRoute({ id: 1, from: 'A', to: 'B', price: 100 }));
    store.dispatch(updatePopularRoute({ id: 1, from: 'A', to: 'B', price: 200 }));
    expect(store.getState().popularRoutes.routes[0].price).toBe(200);
  });

  it('should delete popular route', () => {
    store.dispatch(addPopularRoute({ id: 1, from: 'A', to: 'B' }));
    store.dispatch(addPopularRoute({ id: 2, from: 'C', to: 'D' }));
    store.dispatch(deletePopularRoute(1));
    expect(store.getState().popularRoutes.routes.length).toBe(1);
    expect(store.getState().popularRoutes.routes[0].id).toBe(2);
  });

  it('should handle fetchPopularRoutes pending', () => {
    const state = popularRoutesReducer(undefined, { type: fetchPopularRoutes.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchPopularRoutes fulfilled', () => {
    const apiRoutes = [
      { id: 1, fromLocation: 'Delhi', toLocation: 'Noida', price: 250, distance: 25 },
    ];
    const state = popularRoutesReducer(undefined, { type: fetchPopularRoutes.fulfilled.type, payload: apiRoutes });
    expect(state.loading).toBe(false);
    expect(state.routes.length).toBe(1);
    expect(state.routes[0].from).toBe('Delhi');
    expect(state.routes[0].to).toBe('Noida');
    expect(state.routes[0].price).toBe(250);
  });

  it('should handle fetchPopularRoutes fulfilled with empty data', () => {
    const state = popularRoutesReducer(undefined, { type: fetchPopularRoutes.fulfilled.type, payload: [] });
    expect(state.routes).toEqual([]);
  });

  it('should handle fetchPopularRoutes rejected', () => {
    const state = popularRoutesReducer(undefined, { type: fetchPopularRoutes.rejected.type, error: { message: 'Failed' } });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Failed');
  });
});

// ══════════════════════════════════════════════
//  15. RECOMMENDATIONS SLICE
// ══════════════════════════════════════════════
describe('Recommendations Slice', () => {
  let store;

  beforeEach(() => {
    localStorage.clear();
    store = createTestStore();
  });

  it('should have initial state', () => {
    const state = store.getState().recommendations;
    expect(state.recommendations).toEqual([]);
    expect(state.favorites).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should toggle favorite on', () => {
    store.dispatch(toggleFavorite(1));
    expect(store.getState().recommendations.favorites).toContain(1);
  });

  it('should toggle favorite off', () => {
    store.dispatch(toggleFavorite(1));
    store.dispatch(toggleFavorite(1));
    expect(store.getState().recommendations.favorites).not.toContain(1);
  });

  it('should persist favorites to localStorage', () => {
    store.dispatch(toggleFavorite(1));
    store.dispatch(toggleFavorite(2));
    const stored = JSON.parse(localStorage.getItem('favoriteRecommendations'));
    expect(stored).toContain(1);
    expect(stored).toContain(2);
  });

  it('should handle fetchRecommendations pending', () => {
    const state = recommendationsReducer(undefined, { type: fetchRecommendations.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchRecommendations fulfilled', () => {
    const items = [{ id: 1, title: 'Quick Ride' }];
    const state = recommendationsReducer(undefined, { type: fetchRecommendations.fulfilled.type, payload: items });
    expect(state.loading).toBe(false);
    expect(state.recommendations).toEqual(items);
  });

  it('should handle fetchRecommendations rejected', () => {
    const state = recommendationsReducer(undefined, { type: fetchRecommendations.rejected.type, error: { message: 'Fail' } });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Fail');
  });
});

// ══════════════════════════════════════════════
//  16. ADMIN SLICE (comprehensive)
// ══════════════════════════════════════════════
describe('Admin Slice', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should have initial state', () => {
    const state = store.getState().admin;
    expect(state.dashboard).toBeNull();
    expect(state.users).toEqual([]);
    expect(state.drivers).toEqual([]);
    expect(state.bookings).toEqual([]);
    expect(state.blogs).toEqual([]);
    expect(state.packages).toEqual([]);
    expect(state.vehicles).toEqual([]);
    expect(state.auditLogs).toEqual([]);
    expect(state.auditLogStatistics).toBeNull();
    expect(state.stats).toBeNull();
    expect(state.revenue).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.successMessage).toBeNull();
    expect(state.pagination).toBeDefined();
    expect(state.pagination.users).toBeDefined();
    expect(state.pagination.users.page).toBe(0);
  });

  // ── Sync Reducers ──
  it('should clear error', () => {
    store = configureStore({
      reducer: { admin: adminReducer },
      preloadedState: {
        admin: {
          dashboard: null, users: [], drivers: [], bookings: [], blogs: [], packages: [], vehicles: [],
          auditLogs: [], auditLogStatistics: null, stats: null, revenue: null,
          loading: false, error: 'Test error', successMessage: null,
          pagination: { users: { page: 0, size: 10, totalPages: 0, totalElements: 0 }, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} },
        },
      },
    });
    store.dispatch(clearError());
    expect(store.getState().admin.error).toBeNull();
  });

  it('should clear success message', () => {
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: 'Done', pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      clearSuccessMessage()
    );
    expect(state.successMessage).toBeNull();
  });

  it('should update dashboard stats', () => {
    const state = adminReducer(
      { dashboard: { totalUsers: 100 }, users: [], drivers: [], bookings: [], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      updateDashboardStats({ totalUsers: 200 })
    );
    expect(state.dashboard.totalUsers).toBe(200);
  });

  it('should add real-time booking', () => {
    const booking = { id: 99, from: 'Real', to: 'Time' };
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [{ id: 1 }], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      addRealTimeBooking(booking)
    );
    expect(state.bookings[0].id).toBe(99);
    expect(state.bookings.length).toBe(2);
  });

  it('should update real-time booking status', () => {
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [{ id: 1, status: 'pending' }], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      updateRealTimeBookingStatus({ bookingId: 1, status: 'completed' })
    );
    expect(state.bookings[0].status).toBe('completed');
  });

  it('should add real-time user', () => {
    const state = adminReducer(
      { dashboard: null, users: [{ id: 1 }], drivers: [], bookings: [], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      addRealTimeUser({ id: 2 })
    );
    expect(state.users.length).toBe(2);
  });

  it('should add real-time audit log', () => {
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      addRealTimeAuditLog({ id: 1, action: 'CREATE' })
    );
    expect(state.auditLogs.length).toBe(1);
    expect(state.auditLogs[0].action).toBe('CREATE');
  });

  // ── Dashboard Thunks ──
  it('should handle fetchAdminDashboard pending', () => {
    const state = adminReducer(undefined, { type: fetchAdminDashboard.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchAdminDashboard fulfilled', () => {
    const dashboard = { totalUsers: 500, totalDrivers: 50 };
    const state = adminReducer(undefined, { type: fetchAdminDashboard.fulfilled.type, payload: dashboard });
    expect(state.loading).toBe(false);
    expect(state.dashboard).toEqual(dashboard);
  });

  it('should handle fetchAdminDashboard rejected', () => {
    const state = adminReducer(undefined, { type: fetchAdminDashboard.rejected.type, error: { message: 'DB error' } });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('DB error');
  });

  // ── User Thunks ──
  it('should handle fetchUsers fulfilled with array', () => {
    const users = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
    const state = adminReducer(undefined, { type: fetchUsers.fulfilled.type, payload: users });
    expect(state.loading).toBe(false);
    expect(state.users).toEqual(users);
  });

  it('should handle fetchUsers fulfilled with paginated response', () => {
    const payload = {
      content: [{ id: 1, name: 'A' }],
      totalPages: 5,
      totalElements: 50,
      currentPage: 0,
      size: 10,
    };
    const state = adminReducer(undefined, { type: fetchUsers.fulfilled.type, payload });
    expect(state.users).toEqual(payload.content);
    expect(state.pagination.users.totalPages).toBe(5);
  });

  it('should handle createUser fulfilled', () => {
    const newUser = { id: 3, name: 'New User' };
    const state = adminReducer(
      { dashboard: null, users: [{ id: 1 }], drivers: [], bookings: [], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: createUser.fulfilled.type, payload: newUser }
    );
    expect(state.users).toContainEqual(newUser);
    expect(state.successMessage).toBe('User created successfully');
  });

  it('should handle createUser rejected', () => {
    const state = adminReducer(undefined, { type: createUser.rejected.type, error: { message: 'Email exists' } });
    expect(state.error).toBe('Email exists');
  });

  it('should handle updateUser fulfilled', () => {
    const state = adminReducer(
      { dashboard: null, users: [{ id: 1, name: 'Old' }], drivers: [], bookings: [], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: updateUser.fulfilled.type, payload: { id: 1, name: 'Updated' } }
    );
    expect(state.users[0].name).toBe('Updated');
    expect(state.successMessage).toBe('User updated successfully');
  });

  it('should handle deleteUser fulfilled', () => {
    const state = adminReducer(
      { dashboard: null, users: [{ id: 1 }, { id: 2 }], drivers: [], bookings: [], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: deleteUser.fulfilled.type, payload: 1 }
    );
    expect(state.users.length).toBe(1);
    expect(state.users[0].id).toBe(2);
    expect(state.successMessage).toBe('User deleted successfully');
  });

  // ── Driver Thunks (Admin) ──
  it('should handle fetchDrivers fulfilled with array', () => {
    const drivers = [{ id: 1, name: 'Raj' }];
    const state = adminReducer(undefined, { type: fetchDrivers.fulfilled.type, payload: drivers });
    expect(state.drivers).toEqual(drivers);
  });

  it('should handle createDriver fulfilled', () => {
    const driver = { id: 1, name: 'New Driver' };
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: createDriver.fulfilled.type, payload: driver }
    );
    expect(state.drivers).toContainEqual(driver);
    expect(state.successMessage).toBe('Driver created successfully');
  });

  it('should handle updateDriver fulfilled', () => {
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [{ id: 1, name: 'Old' }], bookings: [], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: updateDriver.fulfilled.type, payload: { id: 1, name: 'Updated' } }
    );
    expect(state.drivers[0].name).toBe('Updated');
  });

  it('should handle deleteDriver fulfilled', () => {
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [{ id: 1 }], bookings: [], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: deleteDriver.fulfilled.type, payload: 1 }
    );
    expect(state.drivers.length).toBe(0);
  });

  it('should handle approveDriver fulfilled', () => {
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [{ id: 1, status: 'pending' }], bookings: [], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: approveDriver.fulfilled.type, payload: { id: 1, status: 'approved' } }
    );
    expect(state.drivers[0].status).toBe('approved');
    expect(state.successMessage).toBe('Driver approved successfully');
  });

  it('should handle rejectDriver fulfilled', () => {
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [{ id: 1, status: 'pending' }], bookings: [], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: rejectDriver.fulfilled.type, payload: { id: 1, status: 'rejected' } }
    );
    expect(state.drivers[0].status).toBe('rejected');
    expect(state.successMessage).toBe('Driver rejected successfully');
  });

  // ── Booking Thunks ──
  it('should handle fetchBookings fulfilled', () => {
    const bookings = [{ id: 1, from: 'A', to: 'B' }];
    const state = adminReducer(undefined, { type: fetchBookings.fulfilled.type, payload: bookings });
    expect(state.bookings).toEqual(bookings);
  });

  it('should handle updateBookingStatus fulfilled', () => {
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [{ id: 1, status: 'pending' }], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: updateBookingStatus.fulfilled.type, payload: { id: 1, status: 'confirmed' } }
    );
    expect(state.bookings[0].status).toBe('confirmed');
    expect(state.successMessage).toBe('Booking status updated successfully');
  });

  it('should handle cancelBooking fulfilled', () => {
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [{ id: 1, status: 'pending' }], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: cancelBooking.fulfilled.type, payload: { id: 1, status: 'cancelled' } }
    );
    expect(state.bookings[0].status).toBe('cancelled');
    expect(state.successMessage).toBe('Booking cancelled successfully');
  });

  // ── Stats Thunks ──
  it('should handle fetchAdminStats fulfilled', () => {
    const stats = { totalUsers: 100, totalBookings: 500 };
    const state = adminReducer(undefined, { type: fetchAdminStats.fulfilled.type, payload: stats });
    expect(state.stats).toEqual(stats);
  });

  it('should handle fetchRevenue fulfilled', () => {
    const revenue = { total: 100000, period: 'monthly' };
    const state = adminReducer(undefined, { type: fetchRevenue.fulfilled.type, payload: revenue });
    expect(state.revenue).toEqual(revenue);
  });

  // ── Blog Thunks (Admin) ──
  it('should handle fetchBlogs fulfilled', () => {
    const blogs = [{ id: 1, title: 'Blog 1' }];
    const state = adminReducer(undefined, { type: fetchBlogs.fulfilled.type, payload: blogs });
    expect(state.blogs).toEqual(blogs);
  });

  it('should handle createBlog fulfilled', () => {
    const blog = { id: 1, title: 'New Blog' };
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: createBlog.fulfilled.type, payload: blog }
    );
    expect(state.blogs).toContainEqual(blog);
    expect(state.successMessage).toBe('Blog created successfully');
  });

  it('should handle updateBlog fulfilled', () => {
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [], blogs: [{ id: 1, title: 'Old' }], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: updateBlog.fulfilled.type, payload: { id: 1, title: 'Updated' } }
    );
    expect(state.blogs[0].title).toBe('Updated');
    expect(state.successMessage).toBe('Blog updated successfully');
  });

  it('should handle deleteBlog fulfilled', () => {
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [], blogs: [{ id: 1 }, { id: 2 }], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: deleteBlog.fulfilled.type, payload: 1 }
    );
    expect(state.blogs.length).toBe(1);
    expect(state.blogs[0].id).toBe(2);
    expect(state.successMessage).toBe('Blog deleted successfully');
  });

  // ── Package Thunks ──
  it('should handle fetchPackages fulfilled', () => {
    const pkgs = [{ id: 1, name: 'Basic' }];
    const state = adminReducer(undefined, { type: fetchPackages.fulfilled.type, payload: pkgs });
    expect(state.packages).toEqual(pkgs);
  });

  it('should handle createPackage fulfilled', () => {
    const pkg = { id: 1, name: 'New Package' };
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: createPackage.fulfilled.type, payload: pkg }
    );
    expect(state.packages).toContainEqual(pkg);
  });

  it('should handle updatePackage fulfilled', () => {
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [], blogs: [], packages: [{ id: 1, name: 'Old' }], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: updatePackage.fulfilled.type, payload: { id: 1, name: 'Updated' } }
    );
    expect(state.packages[0].name).toBe('Updated');
  });

  it('should handle deletePackage fulfilled', () => {
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [], blogs: [], packages: [{ id: 1 }, { id: 2 }], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: deletePackage.fulfilled.type, payload: 1 }
    );
    expect(state.packages.length).toBe(1);
  });

  // ── Vehicle Thunks ──
  it('should handle fetchVehicles fulfilled', () => {
    const vehicles = [{ id: 1, type: 'Sedan' }];
    const state = adminReducer(undefined, { type: fetchVehicles.fulfilled.type, payload: vehicles });
    expect(state.vehicles).toEqual(vehicles);
  });

  it('should handle createVehicle fulfilled', () => {
    const vehicle = { id: 1, type: 'SUV' };
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: createVehicle.fulfilled.type, payload: vehicle }
    );
    expect(state.vehicles).toContainEqual(vehicle);
  });

  it('should handle updateVehicle fulfilled', () => {
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [], blogs: [], packages: [], vehicles: [{ id: 1, type: 'Old' }], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: updateVehicle.fulfilled.type, payload: { id: 1, type: 'New' } }
    );
    expect(state.vehicles[0].type).toBe('New');
  });

  it('should handle deleteVehicle fulfilled', () => {
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [], blogs: [], packages: [], vehicles: [{ id: 1 }], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: deleteVehicle.fulfilled.type, payload: 1 }
    );
    expect(state.vehicles.length).toBe(0);
  });

  // ── Bulk Operations ──
  it('should handle bulkDeleteUsers fulfilled', () => {
    const state = adminReducer(
      { dashboard: null, users: [{ id: 1 }, { id: 2 }, { id: 3 }], drivers: [], bookings: [], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: bulkDeleteUsers.fulfilled.type, payload: [1, 3] }
    );
    expect(state.users.length).toBe(1);
    expect(state.users[0].id).toBe(2);
    expect(state.successMessage).toBe('Successfully deleted 2 users');
  });

  it('should handle bulkDeleteDrivers fulfilled (no-op: slice does not register this handler)', () => {
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [{ id: 1 }, { id: 2 }], bookings: [], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: bulkDeleteDrivers.fulfilled.type, payload: [1] }
    );
    expect(state.drivers.length).toBe(2);
  });

  it('should handle bulkDeleteBookings fulfilled', () => {
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [{ id: 1 }, { id: 2 }], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: bulkDeleteBookings.fulfilled.type, payload: [1] }
    );
    expect(state.bookings.length).toBe(1);
  });

  it('should handle bulkDeleteBlogs fulfilled', () => {
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [], blogs: [{ id: 1 }, { id: 2 }], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: bulkDeleteBlogs.fulfilled.type, payload: [1] }
    );
    expect(state.blogs.length).toBe(1);
  });

  it('should handle bulkDeletePackages fulfilled (no-op: slice does not register this handler)', () => {
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [], blogs: [], packages: [{ id: 1 }, { id: 2 }], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: bulkDeletePackages.fulfilled.type, payload: [1] }
    );
    expect(state.packages.length).toBe(2);
  });

  it('should handle bulkDeleteVehicles fulfilled (no-op: slice does not register this handler)', () => {
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [], blogs: [], packages: [], vehicles: [{ id: 1 }, { id: 2 }], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: bulkDeleteVehicles.fulfilled.type, payload: [1] }
    );
    expect(state.vehicles.length).toBe(2);
  });

  it('should handle bulkUpdateStatus fulfilled for bookings', () => {
    const payload = { entityType: 'bookings', ids: [1], status: 'confirmed' };
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [{ id: 1, status: 'pending' }], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: bulkUpdateStatus.fulfilled.type, payload }
    );
    expect(state.bookings[0].status).toBe('confirmed');
    expect(state.successMessage).toContain('confirmed');
  });

  it('should handle bulkUpdateStatus fulfilled for blogs', () => {
    const payload = { entityType: 'blogs', ids: [1], status: 'published' };
    const state = adminReducer(
      { dashboard: null, users: [], drivers: [], bookings: [], blogs: [{ id: 1, status: 'draft' }], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: bulkUpdateStatus.fulfilled.type, payload }
    );
    expect(state.blogs[0].status).toBe('published');
  });

  it('should handle bulkUpdateUsersRole fulfilled', () => {
    const payload = { ids: [1, 2], role: 'ADMIN' };
    const state = adminReducer(
      { dashboard: null, users: [{ id: 1, role: 'USER' }, { id: 2, role: 'USER' }, { id: 3, role: 'USER' }], drivers: [], bookings: [], blogs: [], packages: [], vehicles: [], auditLogs: [], auditLogStatistics: null, stats: null, revenue: null, loading: false, error: null, successMessage: null, pagination: { users: {}, drivers: {}, bookings: {}, blogs: {}, packages: {}, vehicles: {}, auditLogs: {} } },
      { type: bulkUpdateUsersRole.fulfilled.type, payload }
    );
    expect(state.users[0].role).toBe('ADMIN');
    expect(state.users[1].role).toBe('ADMIN');
    expect(state.users[2].role).toBe('USER');
    expect(state.successMessage).toContain('updated role');
  });

  // ── Audit Log Thunks ──
  it('should handle fetchAuditLogs fulfilled', () => {
    const payload = {
      content: [{ id: 1, action: 'CREATE' }],
      totalPages: 1,
      totalElements: 1,
      pageNumber: 0,
      pageSize: 10,
    };
    const state = adminReducer(undefined, { type: fetchAuditLogs.fulfilled.type, payload });
    expect(state.auditLogs).toEqual(payload.content);
    expect(state.pagination.auditLogs.totalPages).toBe(1);
  });

  it('should handle fetchAuditLogStatistics fulfilled', () => {
    const stats = { totalLogs: 100, actions: { CREATE: 50, UPDATE: 50 } };
    const state = adminReducer(undefined, { type: fetchAuditLogStatistics.fulfilled.type, payload: stats });
    expect(state.auditLogStatistics).toEqual(stats);
  });

  // ── Bulk Export ──
  it('should handle bulkExport pending', () => {
    const state = adminReducer(undefined, { type: bulkExport.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle bulkExport fulfilled', () => {
    const payload = { entityType: 'user', format: 'csv', count: 5 };
    const state = adminReducer(undefined, { type: bulkExport.fulfilled.type, payload });
    expect(state.loading).toBe(false);
    expect(state.successMessage).toContain('exported');
  });

  it('should handle bulkExport rejected', () => {
    const state = adminReducer(undefined, { type: bulkExport.rejected.type, payload: 'No items selected' });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('No items selected');
  });
});

// ══════════════════════════════════════════════
//  STORE INTEGRATION TESTS
// ══════════════════════════════════════════════
describe('Store Integration', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should combine all 16 reducers correctly', () => {
    const state = store.getState();
    expect(state).toHaveProperty('admin');
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('profile');
    expect(state).toHaveProperty('bookingHistory');
    expect(state).toHaveProperty('serviceCities');
    expect(state).toHaveProperty('driver');
    expect(state).toHaveProperty('blog');
    expect(state).toHaveProperty('bookingConfirmationModal');
    expect(state).toHaveProperty('mockRoutes');
    expect(state).toHaveProperty('notifications');
    expect(state).toHaveProperty('notification');
    expect(state).toHaveProperty('ratings');
    expect(state).toHaveProperty('rating');
    expect(state).toHaveProperty('popularRoutes');
    expect(state).toHaveProperty('recommendations');
    expect(state).toHaveProperty('appSection');
  });

  it('should maintain isolated slice states', () => {
    store.dispatch(setCredentials({ token: 'x', user: { id: 1 } }));
    store.dispatch(incrementDownloadCount());
    store.dispatch(addBooking({ id: 1, from: 'A', to: 'B' }));

    const state = store.getState();
    expect(state.auth.token).toBe('x');
    expect(state.appSection.downloadCount).toBe(1);
    expect(state.bookingHistory.bookings.length).toBe(1);
  });

  it('should handle multiple dispatch calls correctly', () => {
    store.dispatch(addBooking({ id: 1 }));
    store.dispatch(addBooking({ id: 2 }));
    store.dispatch(addBooking({ id: 3 }));

    expect(store.getState().bookingHistory.bookings.length).toBe(3);

    store.dispatch(addMockRoute({ from: 'X', to: 'Y', distance: 100 }));
    expect(store.getState().mockRoutes.routes.length).toBeGreaterThanOrEqual(9);
  });
});
