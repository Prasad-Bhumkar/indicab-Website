import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDriverRides } from './driverSlice';

const DriverDashboard = () => {
  const dispatch = useDispatch();
  const { rides, loading, error } = useSelector((state) => state.driver);

  useEffect(() => {
    dispatch(fetchDriverRides());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="driver-dashboard">
      <h2>Driver Dashboard</h2>
      <ul>
        {rides.map((ride) => (
          <li key={ride.id}>{ride.from} to {ride.to} - Status: {ride.status}</li>
        ))}
      </ul>
    </div>
  );
};

export default DriverDashboard;
