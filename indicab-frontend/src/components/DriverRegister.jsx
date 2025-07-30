import React, { useState } from 'react';

const DriverRegister = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    vehicle: '',
    license: '',
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Dispatch driver registration action
    setSuccess(true);
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 500 }}>
      <h2 className="mb-4">Driver Registration</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Vehicle Details</label>
          <input type="text" className="form-control" name="vehicle" value={form.vehicle} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">License Number</label>
          <input type="text" className="form-control" name="license" value={form.license} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-primary w-100">Register as Driver</button>
      </form>
      {success && <div className="alert alert-success mt-3">Registration successful! (Backend integration pending)</div>}
    </div>
  );
};

export default DriverRegister;
