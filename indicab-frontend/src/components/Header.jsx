import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { selectCurrentUser } from '../features/auth/authSelectors';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const handleLogout = () => {
    dispatch(logout());
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
    <nav
      className="navbar navbar-expand-lg navbar-dark position-fixed w-100"
      style={{
        zIndex: 1000,
        top: 0,
        background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--secondary-green) 100%)',
      }}
    >
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
            <li className="nav-item">
              <Link className="nav-link text-white" to="/history" onClick={closeMenu}>
                Booking History
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/contact" onClick={closeMenu}>
                Contact Us
              </Link>
            </li>
            {user && (
              <>
                {/* Show dashboard links based on role */}
                {user.role === 'admin' && (
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/admin" onClick={closeMenu}>
                      Admin Dashboard
                    </Link>
                  </li>
                )}
                {user.role === 'driver' && (
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/driver/dashboard" onClick={closeMenu}>
                      Driver Dashboard
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <span className="nav-link text-white">Welcome, {user.name}</span>
                </li>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/profile" onClick={closeMenu}>
                      Profile
                    </Link>
                  </li>
                <li className="nav-item">
                  <button className="nav-link text-white btn btn-link" style={{textDecoration: 'none'}} onClick={handleLogout}>
                    Logout
                  </button>
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
