import React, { useState, useEffect } from 'react';
import { formatPrice } from '../../utils/formatPrice';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/context/ToastContext';
import apiService from '../../services/api';
import { getProductImage } from '../../utils/productImageMapper';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const { showSuccess, showError } = useToast();

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    flavor: '',
    description: '',
    shortDescription: '',
    originalPrice: '',
    imageUrl: '',
    rating: 5.0,
    reviewCount: 0,
    available: true,
    stockQuantity: '',
    weight: '',
    sku: '',
    category: '',
    isPremium: false,
    isFeatured: false,
    isNewArrival: false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadMethod, setUploadMethod] = useState('url');
  const [compressionSettings, setCompressionSettings] = useState({
    maxWidth: 600,
    maxHeight: 400,
    quality: 0.7,
    enabled: true
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.flavor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(product => {
        if (filterStatus === 'available') return product.available;
        if (filterStatus === 'unavailable') return !product.available;
        return true;
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, filterStatus]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProducts();
      setProducts(data);

    } catch (error) {
      showError('Failed to load products. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!productForm.name.trim()) {
      errors.push('Product name is required');
    }

    if (!productForm.price || parseFloat(productForm.price) <= 0) {
      errors.push('Valid price is required');
    }

    if (!productForm.flavor.trim()) {
      errors.push('Flavor is required');
    }

    if (!productForm.description.trim()) {
      errors.push('Description is required');
    }

    if (uploadMethod === 'url' && productForm.imageUrl.trim() && productForm.imageUrl.trim().length > 1000) {
      errors.push('Image URL is too long (maximum 1000 characters)');
    }

    if (uploadMethod === 'file' && !selectedFile && !editingProduct) {
      errors.push('Please select an image file');
    }

    if (productForm.stockQuantity && parseInt(productForm.stockQuantity) < 0) {
      errors.push('Stock quantity cannot be negative');
    }

    if (productForm.originalPrice && parseFloat(productForm.originalPrice) < parseFloat(productForm.price)) {
      errors.push('Original price should be greater than or equal to current price');
    }

    return errors;
  };

  // Image compression and resizing utility
  const compressAndResizeImage = async (file, maxWidth = compressionSettings.maxWidth, maxHeight = compressionSettings.maxHeight, quality = compressionSettings.quality) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Upload file to server with optional compression and resizing
  const uploadFileToServer = async (file) => {
    let processedBlob = file;
    let compressionInfo = null;
    
    if (compressionSettings.enabled && file.type.startsWith('image/')) {
      processedBlob = await compressAndResizeImage(file);
      compressionInfo = {
        originalSize: file.size,
        optimizedSize: processedBlob.size,
        compressionRatio: ((1 - processedBlob.size / file.size) * 100).toFixed(1)
      };
    }

    const reader = new FileReader();
    const base64Promise = new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(processedBlob);
    });
    
    const base64Data = await base64Promise;
    
    const timestamp = Date.now();
    const uniqueId = `smart-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
    
    const localFiles = JSON.parse(localStorage.getItem('localFiles') || '{}');
    localFiles[uniqueId] = {
      originalName: file.name,
      base64Data: base64Data,
      timestamp: timestamp,
      compressionEnabled: compressionSettings.enabled,
      ...compressionInfo
    };
    localStorage.setItem('localFiles', JSON.stringify(localFiles));

    // Background upload to server (optional)
    setTimeout(async () => {
      try {
        const formData = new FormData();
        formData.append('file', processedBlob, file.name);

        const token = localStorage.getItem('token');
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://pinaka-makhana-backend.onrender.com/api';
        const response = await fetch(`${API_BASE_URL}/upload/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
        }
      } catch (error) {
        // Silent fail for background upload
      }
    }, 100);

    return base64Data;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      showError(errors.join(', '));
      return;
    }

    try {
      let imageUrl = productForm.imageUrl;

      if (uploadMethod === 'url') {
        if (!imageUrl) {
          showError('Please provide an image URL or select a file to upload.');
          return;
        }
      } else if (uploadMethod === 'file') {
        if (!selectedFile) {
          showError('Please select an image file to upload.');
          return;
        }

        try {
          showSuccess('Uploading image...');
          imageUrl = await uploadFileToServer(selectedFile);
          showSuccess('Image uploaded successfully!');
        } catch (error) {
          showError('Failed to upload image. Please try again.');
          return;
        }
      }

      const productData = {
        ...productForm,
        imageUrl: imageUrl,
        price: parseFloat(productForm.price),
        originalPrice: parseFloat(productForm.originalPrice) || parseFloat(productForm.price),
        rating: parseFloat(productForm.rating) || 5.0,
        reviewCount: parseInt(productForm.reviewCount) || 0,
        stockQuantity: parseInt(productForm.stockQuantity) || 0
      };

      if (editingProduct) {
        await apiService.updateProduct(editingProduct.id, productData);
        showSuccess('Product updated successfully!');
        // Real-time update: reload products immediately
        await loadProducts();
      } else {
        await apiService.addProduct(productData);
        showSuccess('Product added successfully!');
        // Real-time update: reload products immediately
        await loadProducts();
      }

      resetForm();
    } catch (error) {
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        showError('Access denied. Please ensure you are logged in as an admin and try again.');
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        showError('Authentication failed. Please log in again.');
      } else {
        showError('Failed to save product. Please try again.');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      price: product.price || '',
      flavor: product.flavor || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      originalPrice: product.originalPrice || '',
      imageUrl: product.imageUrl || '',
      rating: product.rating || 5.0,
      reviewCount: product.reviewCount || 0,
      available: product.available !== undefined ? product.available : true,
      stockQuantity: product.stockQuantity || '',
      weight: product.weight || '',
      sku: product.sku || '',
      category: product.category || '',
      isPremium: product.isPremium || false,
      isFeatured: product.isFeatured || false,
      isNewArrival: product.isNewArrival || false
    });
    setShowAddForm(true);
    setUploadMethod('url');
    setImagePreview('');
    setSelectedFile(null);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await apiService.deleteProduct(productId);
      showSuccess('Product deleted successfully!');
      await loadProducts();
    } catch (error) {
      showError('Failed to delete product. Please try again.');
    }
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      price: '',
      flavor: '',
      description: '',
      shortDescription: '',
      originalPrice: '',
      imageUrl: '',
      rating: 5.0,
      reviewCount: 0,
      available: true,
      stockQuantity: '',
      weight: '',
      sku: '',
      category: '',
      isPremium: false,
      isFeatured: false,
      isNewArrival: false
    });
    setEditingProduct(null);
    setShowAddForm(false);
    setSelectedFile(null);
    setImagePreview('');
    setUploadMethod('url');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
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
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          + Add Product
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Products
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, flavor, or description..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Products</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {filteredProducts.length} products
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16">
                        <img
                          className="h-16 w-16 rounded-lg object-cover"
                          src={getProductImage(product)}
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop&crop=center';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.flavor} • {product.weight}
                        </div>
                        <div className="text-xs text-gray-400">
                          SKU: {product.sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(product.price)}
                    </div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.stockQuantity || 0} units
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.available ? 'Available' : 'Unavailable'}
                    </span>
                    {product.isFeatured && (
                      <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Featured
                      </span>
                    )}
                    {product.isPremium && (
                      <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        Premium
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
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
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No products found</div>
          <p className="text-gray-400 mt-2">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={productForm.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Flavor *
                    </label>
                    <input
                      type="text"
                      name="flavor"
                      value={productForm.flavor}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={productForm.price}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Original Price (₹)
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={productForm.originalPrice}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Method
                  </label>
                  <div className="flex space-x-4 mb-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="url"
                        checked={uploadMethod === 'url'}
                        onChange={(e) => setUploadMethod(e.target.value)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Image URL</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="file"
                        checked={uploadMethod === 'file'}
                        onChange={(e) => setUploadMethod(e.target.value)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">File Upload</span>
                    </label>
                  </div>

                  {uploadMethod === 'url' ? (
                    <input
                      type="url"
                      name="imageUrl"
                      value={productForm.imageUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                      {selectedFile && (
                        <div className="mt-2 text-sm text-gray-600">
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      )}

                      {/* Compression Settings */}
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-blue-900">🔧 Image Optimization</h4>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={compressionSettings.enabled}
                              onChange={(e) => setCompressionSettings(prev => ({
                                ...prev,
                                enabled: e.target.checked
                              }))}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-blue-700">Enable Optimization</span>
                          </label>
                        </div>

                        {compressionSettings.enabled && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-blue-700 mb-1">
                                Max Width (px)
                              </label>
                              <input
                                type="number"
                                value={compressionSettings.maxWidth}
                                onChange={(e) => setCompressionSettings(prev => ({
                                  ...prev,
                                  maxWidth: parseInt(e.target.value) || 800
                                }))}
                                className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                min="100"
                                max="2000"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-blue-700 mb-1">
                                Max Height (px)
                              </label>
                              <input
                                type="number"
                                value={compressionSettings.maxHeight}
                                onChange={(e) => setCompressionSettings(prev => ({
                                  ...prev,
                                  maxHeight: parseInt(e.target.value) || 600
                                }))}
                                className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                min="100"
                                max="2000"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-blue-700 mb-1">
                                Quality ({Math.round(compressionSettings.quality * 100)}%)
                              </label>
                              <input
                                type="range"
                                value={compressionSettings.quality}
                                onChange={(e) => setCompressionSettings(prev => ({
                                  ...prev,
                                  quality: parseFloat(e.target.value)
                                }))}
                                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                                min="0.1"
                                max="1"
                                step="0.05"
                              />
                            </div>
                          </div>
                        )}

                        <div className="mt-2 text-xs text-blue-600">
                          {compressionSettings.enabled
                            ? `✅ Images will be optimized to max ${compressionSettings.maxWidth}×${compressionSettings.maxHeight}px at ${Math.round(compressionSettings.quality * 100)}% quality`
                            : '⚡ Original image size will be preserved'
                          }
                        </div>
                      </div>
                    </div>
                  )}

                  {imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight
                    </label>
                    <input
                      type="text"
                      name="weight"
                      value={productForm.weight}
                      onChange={handleInputChange}
                      placeholder="e.g., 100g"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={productForm.sku}
                      onChange={handleInputChange}
                      placeholder="e.g., PM-PP-100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      name="stockQuantity"
                      value={productForm.stockQuantity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={productForm.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select Category</option>
                      <option value="Spicy">Spicy</option>
                      <option value="Sweet">Sweet</option>
                      <option value="Savory">Savory</option>
                      <option value="Classic">Classic</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={productForm.shortDescription}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="available"
                      checked={productForm.available}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Available</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPremium"
                      checked={productForm.isPremium}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Premium</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={productForm.isFeatured}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured</span>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
