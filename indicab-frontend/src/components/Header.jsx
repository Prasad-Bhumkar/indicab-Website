import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';
import { selectCurrentUser } from '../features/auth/authSelectors';
import NotificationBell from './NotificationBell';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const handleLogout = async () => {
    await dispatch(logoutUser());
    closeMenu();
    navigate('/');
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile) setIsMenuOpen(false); // Close menu automatically on desktop
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const userDropdown = document.querySelector('.user-dropdown-menu');
      const dropdownBtn = e.target.closest('.dropdown-toggle');

      if (userDropdown && !dropdownBtn && e.target.closest('.user-dropdown-menu') === null) {
        userDropdown.classList.remove('show');
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const updateBodyPadding = () => {
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        document.body.style.paddingTop = `${navbar.offsetHeight}px`;
      }
    };

    updateBodyPadding();
    window.addEventListener('resize', updateBodyPadding);

    return () => {
      document.body.style.paddingTop = '0';
      window.removeEventListener('resize', updateBodyPadding);
    };
  }, []);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark position-fixed w-100 navbar-gradient">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/" onClick={closeMenu}>
          <i className="bi bi-car-front-fill me-2"></i>
          IndiCab
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={handleMenuToggle}
          aria-expanded={isMenuOpen}
          aria-controls="navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${isMobile && isMenuOpen ? 'show' : ''}`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link text-white" to="/" onClick={closeMenu}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/about" onClick={closeMenu}>
                About Us
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/packages" onClick={closeMenu}>
                Travel Packages
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/blog" onClick={closeMenu}>
                Blog
              </Link>
            </li>
            {/* Check Booking Status - for guests */}
            {!user && (
              <li className="nav-item">
                <Link className="nav-link text-white" to="/bookings/status" onClick={closeMenu}>
                  <i className="bi bi-search me-1"></i>
                  Check Status
                </Link>
              </li>
            )}
            {/* Booking History - only for regular users, not admins */}
            {user && user.role !== 'ADMIN' ? (
              <li className="nav-item">
                <Link className="nav-link text-white" to="/history" onClick={closeMenu}>
                  Booking History
                </Link>
              </li>
            ) : null}
            <li className="nav-item">
              <Link className="nav-link text-white" to="/contact" onClick={closeMenu}>
                Contact Us
              </Link>
            </li>
            {/* Login Button - only for unauthenticated users */}
            {!user && (
              <li className="nav-item">
                <Link className="nav-link text-white" to="/login" onClick={closeMenu}>
                  <i className="bi bi-box-arrow-in-right me-1"></i>
                  Login
                </Link>
              </li>
            )}
            {user && (
              <>
                {/* Show dashboard links based on role */}
                {user.role === 'ADMIN' && (
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/admin" onClick={closeMenu}>
                      <i className="bi bi-speedometer2 me-1"></i>
                      Admin Dashboard
                    </Link>
                  </li>
                )}
                {user.role === 'DRIVER' && (
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/driver/dashboard" onClick={closeMenu}>
                      <i className="bi bi-person-check me-1"></i>
                      Driver Dashboard
                    </Link>
                  </li>
                )}

                {/* Notifications */}
                <li className="nav-item d-flex align-items-center me-2">
                  <NotificationBell />
                </li>

                {/* User Menu Dropdown */}
                <li className="nav-item dropdown">
                  <button
                    className="nav-link text-white dropdown-toggle btn btn-link user-dropdown-toggle"
                    onClick={() => {
                      const menu = document.querySelector('.user-dropdown-menu');
                      if (menu) {
                        menu.classList.toggle('show');
                      }
                    }}
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    {user.name || user.email}
                  </button>
                  <ul className="user-dropdown-menu dropdown-menu dropdown-menu-end">
                    <li>
                      <div className="dropdown-header">
                        <small className="text-muted">Logged in as:</small>
                        <div className="fw-bold">{user.email}</div>
                      </div>
                    </li>
                    <li><hr className="dropdown-divider" /></li>

                    {/* User Menu Items (hidden for admins) */}
                    {user.role !== 'ADMIN' && (
                      <>
                        <li>
                          <Link className="dropdown-item" to="/profile" onClick={closeMenu}>
                            <i className="bi bi-person me-2"></i>
                            My Profile
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/history" onClick={closeMenu}>
                            <i className="bi bi-clock-history me-2"></i>
                            Booking History
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/ride-tracker" onClick={closeMenu}>
                            <i className="bi bi-geo-alt me-2"></i>
                            Track Ride
                          </Link>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                      </>
                    )}

                    {/* Admin Menu Items */}
                    {user.role === 'ADMIN' && (
                      <>
                        <li>
                          <Link className="dropdown-item" to="/admin/dashboard" onClick={closeMenu}>
                            <i className="bi bi-speedometer2 me-2"></i>
                            Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/users" onClick={closeMenu}>
                            <i className="bi bi-people me-2"></i>
                            Users
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/drivers" onClick={closeMenu}>
                            <i className="bi bi-person-badge me-2"></i>
                            Drivers
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/bookings" onClick={closeMenu}>
                            <i className="bi bi-calendar-check me-2"></i>
                            Bookings
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/blogs" onClick={closeMenu}>
                            <i className="bi bi-newspaper me-2"></i>
                            Blogs
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/packages" onClick={closeMenu}>
                            <i className="bi bi-box me-2"></i>
                            Packages
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/vehicles" onClick={closeMenu}>
                            <i className="bi bi-car-front-fill me-2"></i>
                            Vehicles
                          </Link>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                      </>
                    )}

                    {/* Logout Button */}
                    <li>
                      <button
                        className="dropdown-item text-danger logout-btn"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        {user.role === 'ADMIN' ? 'Admin Logout' : 'Logout'}
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
