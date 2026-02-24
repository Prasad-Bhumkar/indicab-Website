import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { adminLoginUser } from '../features/auth/authSlice';
import { adminLoginValidationSchema, validateFormData } from '../features/admin/validationSchemas';
import '../styles/AdminLogin.css';

/**
 * AdminLogin component for admin user authentication
 * Separate login flow from regular user login
 * Validates admin credentials and redirects to admin dashboard on success
 */
const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form using Yup schema
    const validation = await validateFormData(adminLoginValidationSchema, { email, password });
    setValidationErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    // Attempt admin login using dedicated admin endpoint
    try {
      const result = await dispatch(adminLoginUser({ email, password }));

      if (result.payload && result.payload.user) {
        const userRole = result.payload.user.role;

        // User successfully authenticated as admin
        if (userRole === 'ADMIN') {
          // Redirect to admin dashboard
          navigate('/admin', { replace: true });
        }
      }
    } catch (err) {
      // Error is handled by Redux state and validation
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>Admin Login</h1>
          <p className="admin-login-subtitle">Access the admin panel with your credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {/* General error message */}
          {(error || validationErrors.general) && (
            <div className="admin-login-alert alert-danger" role="alert">
              <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error || validationErrors.general}
            </div>
          )}

          {/* Email field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
              <span className="required-mark">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
              placeholder="Enter your admin email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationErrors.email) {
                  setValidationErrors({ ...validationErrors, email: '' });
                }
              }}
              disabled={loading}
              required
              aria-required="true"
              aria-describedby={validationErrors.email ? 'email-error' : undefined}
            />
            {validationErrors.email && (
              <small id="email-error" className="form-error">
                {validationErrors.email}
              </small>
            )}
          </div>

          {/* Password field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
              <span className="required-mark">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationErrors.password) {
                  setValidationErrors({ ...validationErrors, password: '' });
                }
              }}
              disabled={loading}
              required
              aria-required="true"
              aria-describedby={validationErrors.password ? 'password-error' : undefined}
            />
            {validationErrors.password && (
              <small id="password-error" className="form-error">
                {validationErrors.password}
              </small>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading}
            aria-label={loading ? 'Logging in...' : 'Login as admin'}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Logging in...
              </>
            ) : (
              'Login as Admin'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="admin-login-footer">
          <p className="login-links">
            <Link to="/login" className="link-primary">
              Back to User Login
            </Link>
          </p>
          <p className="login-hint">
            Don't have admin credentials?
            <br />
            Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
