/**
 * Mock booking history data for development and offline testing
 * Each booking includes userId to simulate per-user filtering
 * Backend API (/v1/bookings) returns only authenticated user's bookings
 */
export const bookingHistory = [
  {
    id: 1,
    userId: 1,
    from: 'Mumbai',
    to: 'Pune',
    date: '2025-07-15',
    vehicle: 'Sedan',
    fare: 1800,
    amount: 1800,
    status: 'Upcoming'
  },
  {
    id: 2,
    userId: 1,
    from: 'Delhi',
    to: 'Agra',
    date: '2025-07-10',
    vehicle: 'SUV',
    fare: 2500,
    amount: 2500,
    status: 'Completed'
  },
  {
    id: 3,
    userId: 2,
    from: 'Bangalore',
    to: 'Mysore',
    date: '2025-07-05',
    vehicle: 'Luxury',
    fare: 3500,
    amount: 3500,
    status: 'Completed'
  },
  {
    id: 4,
    userId: 1,
    from: 'Chennai',
    to: 'Pondicherry',
    date: '2025-06-20',
    vehicle: 'Sedan',
    fare: 1600,
    amount: 1600,
    status: 'Cancelled'
  }
];
