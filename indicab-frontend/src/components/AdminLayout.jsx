import React, { useState } from 'react';
import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import './AdminLayout.css';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin-login', { replace: true });
  };

  const menuItems = [
    { label: 'Dashboard', icon: '📊', path: '/admin' },
    { label: 'Analytics', icon: '📈', path: '/admin/analytics' },
    { label: 'Audit Logs', icon: '📋', path: '/admin/audit-logs' },
    { label: 'Users', icon: '👥', path: '/admin/users' },
    { label: 'Drivers', icon: '🚕', path: '/admin/drivers' },
    { label: 'Bookings', icon: '🚗', path: '/admin/bookings' },
    { label: 'Vehicles', icon: '🚙', path: '/admin/vehicles' },
    { label: 'Packages', icon: '📦', path: '/admin/packages' },
    { label: 'Blogs', icon: '📝', path: '/admin/blogs' },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Indicab Admin</h2>
          <button 
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="nav-item"
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="nav-icon">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <button 
              className="menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h1 className="admin-page-title">Admin Dashboard</h1>
          </div>
          <div className="header-right">
            <span className="user-info">Admin User</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
