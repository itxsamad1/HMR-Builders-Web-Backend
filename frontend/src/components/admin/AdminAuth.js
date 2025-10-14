import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AdminAuth: Initializing...');
    // Check for existing admin session
    const adminSession = localStorage.getItem('adminSession');
    const adminUserData = localStorage.getItem('adminUser');
    
    console.log('AdminAuth: adminSession =', adminSession);
    console.log('AdminAuth: adminUserData =', adminUserData);
    
    if (adminSession === 'true' && adminUserData) {
      try {
        const userData = JSON.parse(adminUserData);
        console.log('AdminAuth: Setting admin user:', userData);
        setAdminUser(userData);
      } catch (error) {
        console.error('Error parsing admin user data:', error);
        localStorage.removeItem('adminSession');
        localStorage.removeItem('adminUser');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    console.log('AdminAuth: login called with:', userData);
    setAdminUser(userData);
    localStorage.setItem('adminSession', 'true');
    localStorage.setItem('adminUser', JSON.stringify(userData));
    console.log('AdminAuth: login completed, user set to:', userData);
  };

  const logout = () => {
    setAdminUser(null);
    localStorage.removeItem('adminSession');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const value = {
    adminUser,
    isAuthenticated: !!adminUser,
    isLoading,
    login,
    logout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
