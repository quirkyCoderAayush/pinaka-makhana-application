import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../../services/api';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  // Also check when user logs in through regular login
  useEffect(() => {
    const handleUserLogin = () => {
      checkAdminStatus();
    };

    window.addEventListener('userLoggedIn', handleUserLogin);
    return () => window.removeEventListener('userLoggedIn', handleUserLogin);
  }, []);

  const checkAdminStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedAdminUser = localStorage.getItem('adminUser');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // First check if we have stored admin user data
      if (storedAdminUser) {
        try {
          const adminUserData = JSON.parse(storedAdminUser);
          if (adminUserData.role === 'ROLE_ADMIN') {
            setIsAdmin(true);
            setAdminUser(adminUserData);
            setLoading(false);
            return;
          }
        } catch (parseError) {
          console.error('Failed to parse stored admin user:', parseError);
        }
      }

      // Fallback: Decode JWT token to check admin role
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const tokenData = JSON.parse(jsonPayload);
        console.log('Decoded token data:', tokenData); // Debug log
        
        // Check if user has admin role
        if (tokenData.role === 'ROLE_ADMIN' || (tokenData.authorities && tokenData.authorities.includes('ROLE_ADMIN'))) {
          const adminUserData = {
            name: tokenData.name || tokenData.sub,
            email: tokenData.sub,
            role: tokenData.role
          };
          
          setIsAdmin(true);
          setAdminUser(adminUserData);
          localStorage.setItem('adminUser', JSON.stringify(adminUserData));
        }
      } catch (decodeError) {
        console.error('Failed to decode token:', decodeError);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Admin check failed:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (credentials) => {
    try {
      // Use regular login endpoint since backend doesn't have separate admin login
      const response = await apiService.login(credentials);
      console.log('Admin login response:', response); // Debug log
      
      if (response.token && response.role === 'ROLE_ADMIN') {
        localStorage.setItem('token', response.token);
        
        const adminUserData = {
          name: response.name,
          email: credentials.email,
          role: response.role
        };
        
        // Also store in localStorage for persistence
        localStorage.setItem('adminUser', JSON.stringify(adminUserData));
        
        setIsAdmin(true);
        setAdminUser(adminUserData);
        return { success: true };
      } else if (response.token && response.role !== 'ROLE_ADMIN') {
        return { success: false, error: 'Access denied. Admin privileges required.' };
      }
      return { success: false, error: 'Invalid admin credentials' };
    } catch (error) {
      console.error('Admin login failed:', error); // Debug log
      return { success: false, error: error.message };
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('user'); // Also clear regular user data
    setIsAdmin(false);
    setAdminUser(null);
  };

  const value = {
    isAdmin,
    adminUser,
    loading,
    adminLogin,
    adminLogout,
    checkAdminStatus
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
