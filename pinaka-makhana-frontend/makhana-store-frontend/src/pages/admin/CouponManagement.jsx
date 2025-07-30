import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/context/ToastContext';
import apiService from '../../services/api';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { showSuccess, showError } = useToast();

  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minimumOrderAmount: '',
    maximumDiscountAmount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    userUsageLimit: '',
    active: true,
    firstTimeUserOnly: false,
    freeShipping: false
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  useEffect(() => {
    let filtered = coupons;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(coupon =>
        coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(coupon => {
        if (filterStatus === 'active') return coupon.active;
        if (filterStatus === 'inactive') return !coupon.active;
        if (filterStatus === 'expired') {
          const now = new Date();
          const endDate = new Date(coupon.endDate);
          return endDate < now;
        }
        if (filterStatus === 'upcoming') {
          const now = new Date();
          const startDate = new Date(coupon.startDate);
          return startDate > now;
        }
        if (filterStatus === 'first-time') return coupon.firstTimeUserOnly;
        if (filterStatus === 'free-shipping') return coupon.freeShipping;
        return true;
      });
    }

    setFilteredCoupons(filtered);
  }, [coupons, searchTerm, filterStatus]);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllCoupons();
      setCoupons(data || []);
    } catch (error) {
      console.error('Failed to load coupons:', error);
      showError('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCouponForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    // Basic validation
    if (!couponForm.code.trim()) {
      showError('Coupon code is required');
      return false;
    }
    if (!couponForm.description.trim()) {
      showError('Description is required');
      return false;
    }
    if (!couponForm.discountValue || parseFloat(couponForm.discountValue) <= 0) {
      showError('Discount value must be greater than 0');
      return false;
    }
    if (couponForm.discountType === 'PERCENTAGE' && parseFloat(couponForm.discountValue) > 100) {
      showError('Percentage discount cannot exceed 100%');
      return false;
    }
    if (!couponForm.startDate) {
      showError('Start date is required');
      return false;
    }
    if (!couponForm.endDate) {
      showError('End date is required');
      return false;
    }
    if (new Date(couponForm.startDate) > new Date(couponForm.endDate)) {
      showError('End date must be after start date');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const couponData = {
        code: couponForm.code.trim().toUpperCase(),
        description: couponForm.description.trim(),
        discountType: couponForm.discountType,
        discountValue: parseFloat(couponForm.discountValue),
        minimumOrderAmount: couponForm.minimumOrderAmount ? parseFloat(couponForm.minimumOrderAmount) : 0,
        maximumDiscountAmount: couponForm.maximumDiscountAmount ? parseFloat(couponForm.maximumDiscountAmount) : null,
        startDate: new Date(couponForm.startDate).toISOString(),
        endDate: new Date(couponForm.endDate).toISOString(),
        usageLimit: couponForm.usageLimit ? parseInt(couponForm.usageLimit) : null,
        userUsageLimit: couponForm.userUsageLimit ? parseInt(couponForm.userUsageLimit) : null,
        active: couponForm.active,
        firstTimeUserOnly: couponForm.firstTimeUserOnly,
        freeShipping: couponForm.freeShipping
      };
      
      if (editingCoupon) {
        // Update existing coupon
        await apiService.updateCoupon(editingCoupon.id, couponData);
        showSuccess('Coupon updated successfully');
      } else {
        // Create new coupon
        await apiService.createCoupon(couponData);
        showSuccess('Coupon created successfully');
      }
      
      // Reset form and reload coupons
      resetForm();
      loadCoupons();
    } catch (error) {
      console.error('Failed to save coupon:', error);
      showError('Failed to save coupon. Please try again.');
    }
  };

  const resetForm = () => {
    setCouponForm({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minimumOrderAmount: '',
      maximumDiscountAmount: '',
      startDate: '',
      endDate: '',
      usageLimit: '',
      userUsageLimit: '',
      active: true,
      firstTimeUserOnly: false,
      freeShipping: false
    });
    setEditingCoupon(null);
    setShowAddForm(false);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'PERCENTAGE',
      discountValue: coupon.discountValue?.toString() || '',
      minimumOrderAmount: coupon.minimumOrderAmount?.toString() || '',
      maximumDiscountAmount: coupon.maximumDiscountAmount?.toString() || '',
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit?.toString() || '',
      userUsageLimit: coupon.userUsageLimit?.toString() || '',
      active: coupon.active !== undefined ? coupon.active : true,
      firstTimeUserOnly: coupon.firstTimeUserOnly || false,
      freeShipping: coupon.freeShipping || false
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await apiService.deleteCoupon(id);
        showSuccess('Coupon deleted successfully');
        loadCoupons();
      } catch (error) {
        console.error('Failed to delete coupon:', error);
        showError('Failed to delete coupon');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const coupon = coupons.find(c => c.id === id);
      if (!coupon) return;
      
      const updatedCoupon = { ...coupon, active: !currentStatus };
      await apiService.updateCoupon(id, updatedCoupon);
      showSuccess(`Coupon ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      loadCoupons();
    } catch (error) {
      console.error('Failed to update coupon status:', error);
      showError('Failed to update coupon status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);
    
    if (!coupon.active) {
      return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Inactive</span>;
    }
    
    if (startDate > now) {
      return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Upcoming</span>;
    }
    
    if (endDate < now) {
      return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Expired</span>;
    }
    
    return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Active</span>;
  };

  const getDiscountText = (coupon) => {
    switch (coupon.discountType) {
      case 'PERCENTAGE':
        return `${coupon.discountValue}%`;
      case 'FIXED_AMOUNT':
        return `₹${coupon.discountValue}`;
      case 'FREE_SHIPPING':
        return 'Free Shipping';
      default:
        return `${coupon.discountValue}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Coupon Management</h1>
              <p className="text-gray-600">Create and manage promotional coupons</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </Link>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>{showAddForm ? 'Cancel' : 'Add Coupon'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Add/Edit Coupon Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
            </h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={couponForm.code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="SUMMER2023"
                  disabled={editingCoupon} // Don't allow editing code for existing coupons
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Unique identifier for the coupon</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type *
                </label>
                <select
                  name="discountType"
                  value={couponForm.discountType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED_AMOUNT">Fixed Amount</option>
                  <option value="FREE_SHIPPING">Free Shipping</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value *
                </label>
                <input
                  type="number"
                  name="discountValue"
                  value={couponForm.discountValue}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={couponForm.discountType === 'PERCENTAGE' ? '10' : '100'}
                  min="0"
                  max={couponForm.discountType === 'PERCENTAGE' ? '100' : undefined}
                  step="0.01"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {couponForm.discountType === 'PERCENTAGE' ? 'Percentage discount (0-100)' : 
                   couponForm.discountType === 'FIXED_AMOUNT' ? 'Fixed amount in ₹' : 
                   'Value for free shipping (usually 0)'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Amount
                </label>
                <input
                  type="number"
                  name="minimumOrderAmount"
                  value={couponForm.minimumOrderAmount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="500"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum cart value required to apply this coupon</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Discount Amount
                </label>
                <input
                  type="number"
                  name="maximumDiscountAmount"
                  value={couponForm.maximumDiscountAmount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="200"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum discount amount (for percentage discounts)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={couponForm.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={couponForm.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Usage Limit
                </label>
                <input
                  type="number"
                  name="usageLimit"
                  value={couponForm.usageLimit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="100"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum number of times this coupon can be used</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Per User Usage Limit
                </label>
                <input
                  type="number"
                  name="userUsageLimit"
                  value={couponForm.userUsageLimit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="1"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum number of times a single user can use this coupon</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={couponForm.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Get 10% off on all products"
                  required
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={couponForm.active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="firstTimeUserOnly"
                    name="firstTimeUserOnly"
                    checked={couponForm.firstTimeUserOnly}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="firstTimeUserOnly" className="ml-2 block text-sm text-gray-700">
                    First-time users only
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="freeShipping"
                    name="freeShipping"
                    checked={couponForm.freeShipping}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="freeShipping" className="ml-2 block text-sm text-gray-700">
                    Includes free shipping
                  </label>
                </div>
              </div>

              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-2 rounded-lg font-medium"
                >
                  {editingCoupon ? 'Update Coupon' : 'Add Coupon'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="w-full md:w-1/3">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="search"
                  type="text"
                  placeholder="Search coupons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <label htmlFor="filter" className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                id="filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="all">All Coupons</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
                <option value="upcoming">Upcoming</option>
                <option value="first-time">First-time Users</option>
                <option value="free-shipping">Free Shipping</option>
              </select>
              
              <button
                onClick={loadCoupons}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Coupons List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              All Coupons ({filteredCoupons.length})
              {searchTerm && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  (filtered from {coupons.length})
                </span>
              )}
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading coupons...</p>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No coupons match your current filters.' 
                  : 'No coupons found. Add your first coupon!'
                }
              </p>
              {(searchTerm || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  className="mt-4 text-red-600 hover:text-red-800 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                        <div className="flex mt-1 space-x-1">
                          {coupon.firstTimeUserOnly && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              First Time
                            </span>
                          )}
                          {coupon.freeShipping && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Free Shipping
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{coupon.description}</div>
                        {coupon.minimumOrderAmount > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Min. order: ₹{coupon.minimumOrderAmount}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getDiscountText(coupon)}
                        </div>
                        {coupon.discountType === 'PERCENTAGE' && coupon.maximumDiscountAmount && (
                          <div className="text-xs text-gray-500 mt-1">
                            Max: ₹{coupon.maximumDiscountAmount}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500">
                          From: {formatDate(coupon.startDate)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          To: {formatDate(coupon.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(coupon)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.usageCount || 0} / {coupon.usageLimit || '∞'}
                        </div>
                        {coupon.userUsageLimit && (
                          <div className="text-xs text-gray-500 mt-1">
                            {coupon.userUsageLimit} per user
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(coupon.id, coupon.active)}
                          className={`${coupon.active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {coupon.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
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

export default CouponManagement;