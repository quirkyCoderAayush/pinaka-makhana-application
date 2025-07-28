import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import logo from '../../images/logo.png';

const ModernAdminNavbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { adminUser, adminLogout } = useAdmin();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    adminLogout();
    showSuccess('Logged out successfully');
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Ultra-Modern Admin Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-3xl border-b border-gray-200/30 shadow-xl">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-50/20 via-orange-50/20 to-yellow-50/20 animate-gradient-x"></div>
        
        <div className="relative px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section - Logo & Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Ultra-Modern Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden group bg-white/60 backdrop-blur-xl p-4 rounded-2xl border border-white/30 hover:bg-white/80 hover:border-white/50 transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-110"
              >
                <div className="relative w-6 h-6">
                  {/* Animated hamburger/close icon */}
                  <span className={`absolute top-0 left-0 w-6 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-300 ${sidebarOpen ? 'rotate-45 top-3' : ''}`}></span>
                  <span className={`absolute top-3 left-0 w-6 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-300 ${sidebarOpen ? 'opacity-0' : ''}`}></span>
                  <span className={`absolute top-6 left-0 w-6 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-300 ${sidebarOpen ? '-rotate-45 top-3' : ''}`}></span>
                </div>
              </button>

              {/* Enhanced Logo with Modern Effects */}
              <Link to="/admin/dashboard" className="group flex items-center relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-white/50 backdrop-blur-sm rounded-2xl p-3 border border-white/20 group-hover:border-white/40 transition-all duration-300 group-hover:shadow-lg">
                  <img 
                    src={logo} 
                    alt="Pinaka Admin" 
                    className="h-10 w-auto max-w-[120px] object-contain group-hover:scale-110 transition-all duration-500 bg-transparent mix-blend-multiply"
                    style={{
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                      background: 'transparent'
                    }}
                  />
                </div>
                {/* Floating particles effect */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-red-400 to-orange-400 rounded-full animate-ping opacity-0 group-hover:opacity-75"></div>
                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full animate-pulse opacity-0 group-hover:opacity-75 delay-150"></div>
              </Link>

              {/* Admin Badge */}
              <div className="hidden sm:flex items-center bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-.257-.257A6 6 0 0118 8zM2 8a6 6 0 1010.257 5.743L12 14l-.257-.257A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                Admin Portal
              </div>
            </div>

            {/* Right Section - Profile */}
            <div className="flex items-center space-x-4">
              <div className="relative" ref={profileRef}>
                {/* Enhanced Profile Dropdown Trigger */}
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="group flex items-center space-x-3 bg-white/60 hover:bg-white/80 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/30 hover:border-white/50 transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-red-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <span className="text-white font-bold text-sm">
                        {(adminUser?.name || 'Admin').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {/* Online indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-left">
                      <span className="font-semibold text-gray-800 block text-sm">
                        {adminUser?.name?.split(' ')[0] || 'Admin'}
                      </span>
                      <span className="text-xs text-gray-500">Administrator</span>
                    </div>
                    <svg className={`w-5 h-5 text-gray-600 transition-all duration-500 ${isProfileOpen ? 'rotate-180 text-red-500' : 'group-hover:text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Enhanced Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-72 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 py-3 z-50 animate-in slide-in-from-top-2 duration-300">
                    {/* Enhanced User Info Header */}
                    <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-red-50/50 to-orange-50/50 rounded-t-3xl">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-500 via-red-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {(adminUser?.name || 'Admin').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {/* Status indicator */}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 text-lg">{adminUser?.name || 'Administrator'}</p>
                          <p className="text-sm text-gray-600 font-medium">{adminUser?.email || 'admin@pinaka.com'}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600 font-semibold">Active now</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="py-2">
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-600 transition-all duration-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        </svg>
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        to="/admin/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-600 transition-all duration-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Profile Settings</span>
                      </Link>
                    </div>

                    <div className="border-t border-white/20 pt-2">
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileOpen(false);
                        }}
                        className="flex items-center space-x-3 px-6 py-3 text-red-600 hover:bg-red-50 transition-all duration-300 w-full text-left"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Add top padding to account for fixed header */}
      <div className="h-20"></div>
    </>
  );
};

export default ModernAdminNavbar;
