import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerDriver } from './driverSlice';

const DriverRegister = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.driver);
  const [form, setForm] = useState({ name: '', vehicle: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerDriver(form));
  };

  return (
    <div className="driver-register">
      <h2>Driver Registration</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
        <input name="vehicle" value={form.vehicle} onChange={handleChange} placeholder="Vehicle" required />
        <button type="submit" disabled={loading}>Register</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default DriverRegister;
