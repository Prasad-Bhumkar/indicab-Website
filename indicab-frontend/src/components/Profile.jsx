import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// Placeholder for updateProfile action
// import { updateProfile } from '../features/auth/authSlice';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [editing, setEditing] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setForm({ name: user?.name || '', email: user?.email || '' });
    setEditing(false);
  };
  const handleSave = (e) => {
    e.preventDefault();
    // dispatch(updateProfile(form));
    setEditing(false);
  };

  if (!user) return <div className="container mt-5">Please log in to view your profile.</div>;

  return (
    <div className="container mt-5" style={{ maxWidth: 500 }}>
      <h2 className="mb-4">User Profile</h2>
      <form onSubmit={handleSave}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} disabled={!editing} />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} disabled />
        </div>
        {editing ? (
          <>
            <button type="submit" className="btn btn-success me-2">Save</button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
          </>
        ) : (
          <button type="button" className="btn btn-primary" onClick={handleEdit}>Edit Profile</button>
        )}
      </form>
    </div>
  );
};

export default Profile;
