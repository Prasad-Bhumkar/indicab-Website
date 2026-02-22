import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

/**
 * AdminProtectedRoute component
 * Protects admin-only routes by checking:
 * 1. Token exists in localStorage
 * 2. User role is 'ADMIN' in Redux state
 * 
 * If either condition fails, redirects to /admin-login
 */
const AdminProtectedRoute = ({ children }) => {
  const { token, user } = useSelector((state) => state.auth);
  
  // Check if token exists in localStorage (server-side persistence)
  const storedToken = localStorage.getItem('token');
  
  // Check if user has ADMIN role
  const isAdmin = user?.role === 'ADMIN';
  
  // Log unauthorized access attempts for security monitoring
  if (!storedToken || !token) {
    console.warn('AdminProtectedRoute: Access denied - no authentication token found');
    return <Navigate to="/admin-login" replace />;
  }
  
  if (!isAdmin) {
    console.warn('AdminProtectedRoute: Access denied - user does not have admin role', user?.role);
    return <Navigate to="/admin-login" replace />;
  }
  
  // User is authenticated and has admin role
  return children;
};

export default AdminProtectedRoute;
