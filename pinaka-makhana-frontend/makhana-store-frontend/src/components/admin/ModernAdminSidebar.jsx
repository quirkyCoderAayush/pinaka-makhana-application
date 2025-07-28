import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ModernAdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      ),
      gradient: 'from-green-500 to-green-600'
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      ),
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      name: 'Coupons',
      path: '/admin/coupons',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
        </svg>
      ),
      gradient: 'from-pink-500 to-pink-600'
    }
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Ultra-Modern Enhanced Sidebar */}
      <nav className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white/90 backdrop-blur-3xl shadow-2xl min-h-screen transition-all duration-500 ease-in-out border-r border-white/30`}>

        {/* Enhanced animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/40 via-orange-50/40 to-yellow-50/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-50/20 to-transparent"></div>
        
        <div className="relative">
          {/* Mobile close button */}
          <div className="lg:hidden flex justify-end p-6">
            <button
              onClick={() => setSidebarOpen(false)}
              className="group bg-white/60 backdrop-blur-xl p-3 rounded-2xl border border-white/30 hover:bg-white/80 hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6 text-gray-600 group-hover:text-red-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Enhanced Navigation Header */}
          <div className="px-6 py-8">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="inline-flex items-center bg-gradient-to-r from-red-500 via-red-600 to-orange-500 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] animate-shimmer"></div>
                  <svg className="w-5 h-5 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-.257-.257A6 6 0 0118 8zM2 8a6 6 0 1010.257 5.743L12 14l-.257-.257A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  <span className="relative z-10">Navigation</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Admin Portal</h2>
              <p className="text-sm text-gray-600 font-medium">Manage your Pinaka Makhana store</p>
              <div className="mt-4 flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-semibold">System Online</span>
              </div>
            </div>
          </div>

          {/* Enhanced Navigation Links */}
          <div className="px-6 pb-8">
            <div className="space-y-2">
              {navigationItems.map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center space-x-4 px-6 py-4 rounded-2xl font-semibold transition-all duration-500 transform hover:scale-105 ${
                    isActive(item.path)
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl shadow-${item.gradient.split('-')[1]}-500/25 scale-105`
                      : 'text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:shadow-xl hover:shadow-red-500/20'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Enhanced animated background for hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm`}></div>

                  <div className="relative z-10 flex items-center space-x-4 w-full">
                    <div className={`p-3 rounded-xl ${
                      isActive(item.path)
                        ? 'bg-white/20 shadow-lg'
                        : 'bg-gray-100 group-hover:bg-white/20 group-hover:shadow-lg'
                    } transition-all duration-300 group-hover:scale-110`}>
                      {item.icon}
                    </div>
                    <span className="flex-1 text-base">{item.name}</span>

                    {/* Enhanced indicators */}
                    {isActive(item.path) ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <svg className="w-5 h-5 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  {/* Enhanced shine effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                  {/* Active item glow effect */}
                  {isActive(item.path) && (
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${item.gradient} opacity-20 animate-pulse`}></div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Stats Section */}
          <div className="px-6 pb-6">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Active Products</span>
                  <span className="text-xs font-bold text-green-600">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Pending Orders</span>
                  <span className="text-xs font-bold text-orange-600">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Total Users</span>
                  <span className="text-xs font-bold text-blue-600">156</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <div className="text-center">
              <p className="text-xs text-gray-500">Pinaka Makhana Admin</p>
              <p className="text-xs text-gray-400">v2.0.0</p>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default ModernAdminSidebar;
