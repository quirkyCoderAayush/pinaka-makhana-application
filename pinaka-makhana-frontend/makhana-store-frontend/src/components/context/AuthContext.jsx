import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in on app start
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await apiService.login(credentials);
      
      // Backend returns { token, name, role } structure
      const { token, name, role } = response;
      
      // Create user object with backend data
      const userData = {
        name: name,
        fullName: name, // Map name to fullName for frontend compatibility
        email: credentials.email, // Keep email from credentials
        role: role
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Transform frontend data to match backend AuthRequest
      const backendData = {
        name: userData.fullName, // Backend expects 'name', frontend sends 'fullName'
        email: userData.email,
        password: userData.password,
        isAdmin: false // Default to regular user
      };
      
      const response = await apiService.register(backendData);
      
      // Auto login after successful registration using EMAIL (not username)
      const loginResult = await login({
        email: userData.email, // Backend uses email for login, not username
        password: userData.password
      });
      
      return loginResult;
    } catch (error) {
      console.error('Registration failed:', error);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Add updateUser for updating user details locally
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Add updateProfilePicture for updating only the profile picture
  const updateProfilePicture = (base64Image) => {
    const updatedUser = { ...user, profilePicture: base64Image };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Address management (localStorage, per user)
  const getAddresses = () => {
    if (!user) return [];
    const all = JSON.parse(localStorage.getItem('addresses') || '{}');
    return all[user.email] || [];
  };

  const saveAddresses = (addresses) => {
    if (!user) return;
    const all = JSON.parse(localStorage.getItem('addresses') || '{}');
    all[user.email] = addresses;
    localStorage.setItem('addresses', JSON.stringify(all));
  };

  const addAddress = (address) => {
    const addresses = getAddresses();
    const newAddress = { ...address, id: Date.now() };
    const updated = [...addresses, newAddress];
    saveAddresses(updated);
    return updated;
  };

  const updateAddress = (address) => {
    const addresses = getAddresses();
    const updated = addresses.map(a => a.id === address.id ? address : a);
    saveAddresses(updated);
    return updated;
  };

  const deleteAddress = (id) => {
    const addresses = getAddresses();
    const updated = addresses.filter(a => a.id !== id);
    saveAddresses(updated);
    return updated;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    updateProfilePicture,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
