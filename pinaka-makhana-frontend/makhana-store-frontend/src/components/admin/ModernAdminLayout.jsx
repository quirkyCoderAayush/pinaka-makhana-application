import React, { useState } from 'react';
import ModernAdminNavbar from './ModernAdminNavbar';
import ModernAdminSidebar from './ModernAdminSidebar';

const ModernAdminLayout = ({ children, title, subtitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Modern Admin Navbar */}
      <ModernAdminNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex">
        {/* Modern Admin Sidebar */}
        <ModernAdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-0 p-6 lg:p-8">
          {/* Page Header */}
          {(title || subtitle) && (
            <div className="mb-8">
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    {title && (
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        {title}
                      </h1>
                    )}
                    {subtitle && (
                      <p className="text-gray-600 mt-1 font-medium">{subtitle}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Page Content */}
          <div className="space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ModernAdminLayout;
