import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile } from './profileSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.profile);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) setForm({ name: profile.name, email: profile.email });
  }, [profile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile(form));
    setEdit(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="profile-page">
      <h2>User Profile</h2>
      {edit ? (
        <form onSubmit={handleSubmit}>
          <input name="name" value={form.name} onChange={handleChange} required />
          <input name="email" value={form.email} onChange={handleChange} required />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEdit(false)}>Cancel</button>
        </form>
      ) : (
        <div>
          <p><b>Name:</b> {profile?.name}</p>
          <p><b>Email:</b> {profile?.email}</p>
          <button onClick={() => setEdit(true)}>Edit Profile</button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
