import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, createUser, updateUser, deleteUser, clearSuccessMessage, clearError } from './adminSlice';
import { SkeletonTable } from '../../components/Skeleton';
import './ManagementPages.css';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, loading, error, successMessage } = useSelector((state) => state.admin);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active'
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    dispatch(createUser(formData));
    setShowAddForm(false);
    resetForm();
  };

  const handleEditClick = (user) => {
    setEditingId(user.id);
    setFormData({ ...user });
    setShowAddForm(false);
  };

  const handleSaveEdit = (userId) => {
    dispatch(updateUser({ userId, userData: formData }));
    setEditingId(null);
    resetForm();
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      dispatch(deleteUser(userId));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      status: 'active'
    });
    setEditingId(null);
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status?.toLowerCase() || 'inactive'}`;
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <h3 className="management-title">User Management</h3>
        <button 
          className="add-btn"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingId(null);
            if (!showAddForm) resetForm();
          }}
        >
          {showAddForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
          <button className="close-alert" onClick={() => dispatch(clearError())}>×</button>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <span>{successMessage}</span>
          <button className="close-alert" onClick={() => dispatch(clearSuccessMessage())}>×</button>
        </div>
      )}

      {(showAddForm || editingId) && (
        <div className="form-card">
          <h4>{editingId ? 'Edit User' : 'Add New User'}</h4>
          <form onSubmit={editingId ? (e) => { e.preventDefault(); handleSaveEdit(editingId); } : handleAddUser}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="add-btn" style={{backgroundColor: '#6b7280'}} onClick={() => { setShowAddForm(false); setEditingId(null); }}>
                Cancel
              </button>
              <button type="submit" className="add-btn">
                {editingId ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !users.length ? (
        <SkeletonTable rows={8} />
      ) : (
        <div className="table-responsive">
          <table className="management-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <span className={getStatusClass(user.status)}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon btn-edit" onClick={() => handleEditClick(user)} title="Edit">
                          ✏️
                        </button>
                        <button className="btn-icon btn-delete" onClick={() => handleDeleteUser(user.id)} title="Delete">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
