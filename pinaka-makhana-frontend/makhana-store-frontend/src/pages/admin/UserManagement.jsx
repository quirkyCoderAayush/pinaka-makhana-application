import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/context/ToastContext';
import apiService from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Use the corrected API service that extracts users from orders
      const userData = await apiService.getAllUsers();
      
      setUsers(userData || []);
      console.log('Loaded users:', userData); // Debug log
    } catch (error) {
      console.error('Failed to load users:', error);
      showError('Failed to load users. Please make sure you are logged in.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserTypeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
      case 'role_admin':
        return 'bg-purple-100 text-purple-800';
      case 'user':
      case 'role_user':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // User action handlers
  const viewUserDetails = async (user) => {
    try {
      const stats = await apiService.getUserStatistics(user.id);
      const orderStatusText = Object.entries(stats.orderStatusBreakdown || {})
        .map(([status, count]) => `${status}: ${count}`)
        .join(', ') || 'No orders';

      alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone}\nAddress: ${user.address}\nCity: ${user.city}, ${user.state} ${user.zipCode}\nCountry: ${user.country}\nRole: ${user.role}\nStatus: ${user.status}\nTotal Orders: ${stats.totalOrders}\nTotal Spent: ₹${stats.totalSpent.toFixed(2)}\nAverage Order Value: ₹${stats.averageOrderValue.toFixed(2)}\nJoin Date: ${formatDate(stats.joinDate)}\nLast Order: ${formatDate(stats.lastOrderDate)}\nOrder Status Breakdown: ${orderStatusText}`);
    } catch (error) {
      console.error('Failed to get user details:', error);
      alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone}\nRole: ${user.role}\nTotal Orders: ${user.totalOrders}\nTotal Spent: ₹${user.totalSpent.toFixed(2)}\nStatus: ${user.status}`);
    }
  };

  const toggleUserStatus = async (user) => {
    const newStatus = user.status === 'active' ? false : true;
    const action = newStatus ? 'activate' : 'deactivate';

    if (window.confirm(`Are you sure you want to ${action} ${user.name}?`)) {
      try {
        await apiService.updateUserStatus(user.id, newStatus);
        showSuccess(`User ${action}d successfully`);
        loadUsers(); // Reload users
      } catch (error) {
        console.error('Failed to update user status:', error);
        showError(`Failed to ${action} user`);
      }
    }
  };

  const promoteToAdmin = async (user) => {
    if (window.confirm(`Are you sure you want to make ${user.name} an admin? This will give them full administrative privileges.`)) {
      try {
        await apiService.updateUserRole(user.id, 'ROLE_ADMIN');
        showSuccess(`${user.name} has been promoted to admin`);
        loadUsers(); // Reload users
      } catch (error) {
        console.error('Failed to promote user:', error);
        showError('Failed to promote user to admin');
      }
    }
  };

  const demoteFromAdmin = async (user) => {
    if (window.confirm(`Are you sure you want to remove admin privileges from ${user.name}?`)) {
      try {
        await apiService.updateUserRole(user.id, 'ROLE_USER');
        showSuccess(`${user.name} has been demoted to regular user`);
        loadUsers(); // Reload users
      } catch (error) {
        console.error('Failed to demote user:', error);
        showError('Failed to demote user');
      }
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
              <p className="text-gray-600">Manage customer accounts and track user activity</p>
            </div>
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            <div className="ml-4">
              <span className="text-sm text-gray-600">
                Total Users: <span className="font-semibold">{users.length}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              All Users ({filteredUsers.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchTerm ? 'No users found' : 'No users yet'}
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'Users will appear here once they register and make purchases.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUserTypeColor(user.role)}`}>
                          {user.role === 'ROLE_ADMIN' ? 'Admin' : 'Customer'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span className="font-medium">{user.totalOrders || 0}</span>
                          <span className="ml-1 text-gray-400">orders</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span className="font-medium">₹{(user.totalSpent || 0).toFixed(2)}</span>
                        </div>
                        {user.totalOrders > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Avg: ₹{((user.totalSpent || 0) / user.totalOrders).toFixed(2)} per order
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="font-medium">
                            {formatDate(user.lastOrderDate)}
                          </div>
                          {user.lastOrderDate && (
                            <div className="text-xs text-gray-400">
                              {(() => {
                                const daysDiff = Math.floor((new Date() - new Date(user.lastOrderDate)) / (1000 * 60 * 60 * 24));
                                if (daysDiff === 0) return 'Today';
                                if (daysDiff === 1) return 'Yesterday';
                                if (daysDiff < 7) return `${daysDiff} days ago`;
                                if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`;
                                return `${Math.floor(daysDiff / 30)} months ago`;
                              })()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => viewUserDetails(user)}
                            className="text-blue-600 hover:text-blue-900 font-medium text-left"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user)}
                            className={`font-medium text-left ${
                              user.status === 'active'
                                ? 'text-red-600 hover:text-red-900'
                                : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          {user.role === 'ROLE_ADMIN' ? (
                            <button
                              onClick={() => demoteFromAdmin(user)}
                              className="text-orange-600 hover:text-orange-900 font-medium text-left"
                            >
                              Remove Admin
                            </button>
                          ) : (
                            <button
                              onClick={() => promoteToAdmin(user)}
                              className="text-purple-600 hover:text-purple-900 font-medium text-left"
                            >
                              Make Admin
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
