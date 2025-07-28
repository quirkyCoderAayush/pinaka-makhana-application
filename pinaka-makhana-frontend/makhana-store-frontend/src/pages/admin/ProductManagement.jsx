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
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.flavor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
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
      console.log('Loading products...');
      const data = await apiService.getProducts();
      setProducts(data || []);
      console.log(`Loaded ${data?.length || 0} products successfully`);
    } catch (error) {
      console.error('Failed to load products:', error);
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

  // Form validation
  const validateForm = () => {
    const errors = [];

    if (!productForm.name.trim()) {
      errors.push('Product name is required');
    }

    if (!productForm.price || parseFloat(productForm.price) <= 0) {
      errors.push('Product price must be greater than 0');
    }

    if (!productForm.description.trim()) {
      errors.push('Product description is required');
    }

    if (uploadMethod === 'url' && !productForm.imageUrl.trim()) {
      errors.push('Product image URL is required');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showError(`Please fix the following errors:\n${validationErrors.join('\n')}`);
      return;
    }

    // Check admin authentication
    const token = localStorage.getItem('token');
    const adminUser = localStorage.getItem('adminUser');

    if (!token || !adminUser) {
      showError('Authentication required. Please log in as an admin.');
      return;
    }

    try {
      const adminUserData = JSON.parse(adminUser);
      if (adminUserData.role !== 'ROLE_ADMIN') {
        showError('Admin privileges required to manage products.');
        return;
      }
    } catch (parseError) {
      showError('Invalid admin session. Please log in again.');
      return;
    }

    try {
      let imageUrl = productForm.imageUrl.trim();

      // Handle file upload if a file is selected
      if (uploadMethod === 'file' && selectedFile) {
        try {
          // Convert file to base64 (in a real app, you'd upload to a server/cloud storage)
          imageUrl = await convertFileToBase64(selectedFile);
          showSuccess('Image uploaded successfully!');
        } catch (error) {
          console.error('Failed to process image:', error);
          showError('Failed to process image. Please try again.');
          return;
        }
      }

      const productData = {
        name: productForm.name.trim(),
        price: parseFloat(productForm.price),
        flavor: productForm.flavor.trim() || 'Original',
        description: productForm.description.trim(),
        shortDescription: productForm.shortDescription.trim() || productForm.description.trim().substring(0, 100),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
        imageUrl: imageUrl,
        rating: parseFloat(productForm.rating) || 5.0,
        reviewCount: parseInt(productForm.reviewCount) || 0,
        available: productForm.available,
        stockQuantity: productForm.stockQuantity ? parseInt(productForm.stockQuantity) : 100,
        weight: productForm.weight.trim() || '100g',
        sku: productForm.sku.trim() || null,
        category: productForm.category || 'ROASTED_MAKHANA',
        isPremium: productForm.isPremium,
        isFeatured: productForm.isFeatured,
        isNewArrival: productForm.isNewArrival
      };

      console.log('Submitting product data:', productData); // Debug log
      console.log('Admin user:', adminUserData); // Debug log

      if (editingProduct) {
        // Update existing product
        await apiService.updateProduct(editingProduct.id, productData);
        showSuccess('Product updated successfully!');
      } else {
        // Add new product
        await apiService.addProduct(productData);
        showSuccess('Product added successfully!');
      }

      resetForm();
      await loadProducts(); // Wait for products to reload
    } catch (error) {
      console.error('Failed to save product:', error);

      // Enhanced error handling
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        showError('Access denied. Please ensure you are logged in as an admin and try again.');
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        showError('Session expired. Please log in again.');
      } else {
        showError(`Failed to save product: ${error.message}`);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      price: product.price?.toString() || '',
      flavor: product.flavor || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      originalPrice: product.originalPrice?.toString() || '',
      imageUrl: product.imageUrl || '',
      rating: product.rating?.toString() || '5.0',
      reviewCount: product.reviewCount?.toString() || '0',
      available: product.available !== undefined ? product.available : true,
      stockQuantity: product.stockQuantity?.toString() || '',
      weight: product.weight || '',
      sku: product.sku || '',
      category: product.category || '',
      isPremium: product.isPremium || false,
      isFeatured: product.isFeatured || false,
      isNewArrival: product.isNewArrival || false
    });

    // Set up image preview for existing product
    if (product.imageUrl) {
      setImagePreview(product.imageUrl);
      setUploadMethod('url');
    } else {
      setImagePreview('');
      setUploadMethod('url');
    }
    setSelectedFile(null);

    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await apiService.deleteProduct(productId);
      showSuccess('Product deleted successfully!');
      loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
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

  // Handle file selection for image upload
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showError('Please select a valid image file (JPEG, PNG, or WebP)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        showError('Image file size must be less than 5MB');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert file to base64 for storage (in a real app, you'd upload to a server)
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      showError('Please select products to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      return;
    }

    try {
      await Promise.all(selectedProducts.map(id => apiService.deleteProduct(id)));
      showSuccess(`${selectedProducts.length} products deleted successfully!`);
      setSelectedProducts([]);
      loadProducts();
    } catch (error) {
      console.error('Failed to delete products:', error);
      showError('Failed to delete some products. Please try again.');
    }
  };

  const handleBulkStatusChange = async (status) => {
    if (selectedProducts.length === 0) {
      showError('Please select products to update');
      return;
    }

    try {
      const updates = selectedProducts.map(async (id) => {
        const product = products.find(p => p.id === id);
        return apiService.updateProduct(id, { ...product, available: status });
      });
      
      await Promise.all(updates);
      showSuccess(`${selectedProducts.length} products updated successfully!`);
      setSelectedProducts([]);
      loadProducts();
    } catch (error) {
      console.error('Failed to update products:', error);
      showError('Failed to update some products. Please try again.');
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
              <p className="text-gray-600">Manage your Makhana products</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Back to Dashboard
              </Link>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>{showAddForm ? 'Cancel' : 'Add Product'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Add/Edit Product Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Premium Roasted Makhana"
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
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="199.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flavor
                </label>
                <input
                  type="text"
                  name="flavor"
                  value={productForm.flavor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Original, Roasted, Spicy, etc."
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
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="299.00"
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
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight
                </label>
                <input
                  type="text"
                  name="weight"
                  value={productForm.weight}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="100g"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select Category</option>
                  <option value="ROASTED_MAKHANA">Roasted Makhana</option>
                  <option value="FLAVORED_MAKHANA">Flavored Makhana</option>
                  <option value="VARIETY_PACK">Variety Pack</option>
                  <option value="GIFT_BOX">Gift Box</option>
                  <option value="BULK_PACK">Bulk Pack</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <input
                  type="number"
                  name="rating"
                  value={productForm.rating}
                  onChange={handleInputChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="5.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available
                </label>
                <select
                  name="available"
                  value={productForm.available.toString()}
                  onChange={(e) => setProductForm(prev => ({ ...prev, available: e.target.value === 'true' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="true">Available</option>
                  <option value="false">Not Available</option>
                </select>
              </div>

              {/* Product Flags */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Flags
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPremium"
                      checked={productForm.isPremium}
                      onChange={(e) => setProductForm(prev => ({ ...prev, isPremium: e.target.checked }))}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Premium Product</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={productForm.isFeatured}
                      onChange={(e) => setProductForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured Product</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isNewArrival"
                      checked={productForm.isNewArrival}
                      onChange={(e) => setProductForm(prev => ({ ...prev, isNewArrival: e.target.checked }))}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">New Arrival</span>
                  </label>
                </div>
              </div>

              {/* Enhanced Image Upload Section */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>

                {/* Upload Method Selection */}
                <div className="mb-4">
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="uploadMethod"
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
                        name="uploadMethod"
                        value="file"
                        checked={uploadMethod === 'file'}
                        onChange={(e) => setUploadMethod(e.target.value)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Upload File</span>
                    </label>
                  </div>
                </div>

                {/* URL Input */}
                {uploadMethod === 'url' && (
                  <div className="mb-4">
                    <input
                      type="url"
                      name="imageUrl"
                      value={productForm.imageUrl}
                      onChange={(e) => {
                        handleInputChange(e);
                        setImagePreview(e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                )}

                {/* File Upload */}
                {uploadMethod === 'file' && (
                  <div className="mb-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                          </svg>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, JPEG or WebP (MAX. 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileSelect}
                        />
                      </label>
                    </div>
                    {selectedFile && (
                      <div className="mt-2 text-sm text-gray-600">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                  </div>
                )}

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setSelectedFile(null);
                          if (uploadMethod === 'url') {
                            setProductForm(prev => ({ ...prev, imageUrl: '' }));
                          }
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Premium roasted makhana with authentic flavors..."
                />
              </div>

              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-2 rounded-lg font-medium"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search products by name, flavor, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Products</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
              
              {selectedProducts.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedProducts.length} selected
                  </span>
                  <button
                    onClick={() => handleBulkStatusChange(true)}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                  >
                    Make Available
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange(false)}
                    className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200 transition-colors"
                  >
                    Make Unavailable
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              All Products ({filteredProducts.length})
              {searchTerm && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  (filtered from {products.length})
                </span>
              )}
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No products match your current filters.' 
                  : 'No products found. Add your first product!'
                }
              </p>
              {(searchTerm || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  className="mt-2 text-red-600 hover:text-red-800 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                        onChange={toggleAllProducts}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Flavor
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
                    <tr key={product.id} className={selectedProducts.includes(product.id) ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                              src={getProductImage(product)}
                              alt={product.name}
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop&crop=center";
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 space-y-1">
                              <div className="flex items-center space-x-2">
                                <span>Rating: {product.rating || 'N/A'} ⭐</span>
                                {product.reviewCount && (
                                  <span className="text-xs">({product.reviewCount} reviews)</span>
                                )}
                              </div>
                              {product.description && (
                                <div className="text-xs text-gray-400 max-w-xs truncate">
                                  {product.description.length > 50
                                    ? product.description.substring(0, 50) + '...'
                                    : product.description
                                  }
                                </div>
                              )}
                              {product.sku && (
                                <div className="text-xs text-gray-400">
                                  SKU: {product.sku}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">₹{product.price ? formatPrice(product.price) : '0.00'}</div>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="text-xs text-gray-500 line-through">
                              ₹{formatPrice(product.originalPrice)}
                            </div>
                          )}
                          {product.weight && (
                            <div className="text-xs text-gray-500">
                              {product.weight}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {product.flavor || 'Original'}
                          </span>
                          {product.category && (
                            <div className="text-xs text-gray-500">
                              {product.category}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            product.available
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.available ? 'Available' : 'Not Available'}
                          </span>
                          {product.stockQuantity !== undefined && (
                            <div className="text-xs text-gray-500">
                              Stock: {product.stockQuantity}
                            </div>
                          )}
                          <div className="flex space-x-1">
                            {product.isPremium && (
                              <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Premium
                              </span>
                            )}
                            {product.isFeatured && (
                              <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                Featured
                              </span>
                            )}
                            {product.isNewArrival && (
                              <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900"
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
