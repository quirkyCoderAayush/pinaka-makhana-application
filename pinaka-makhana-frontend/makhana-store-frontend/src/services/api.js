const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`
        }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Authentication APIs
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Product APIs
  async getProducts() {
    const products = await this.request('/products');
    return products;
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  // Cart APIs
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(productId, quantity = 1) {
    const url = `${this.baseURL}/cart/add?productId=${productId}&quantity=${quantity}`;
    const token = localStorage.getItem('token');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add item to cart: ${response.status}`);
    }
    
    return await response.text(); // Backend returns text, not JSON
  }

  async updateCartItem(productId, quantity) {
    const url = `${this.baseURL}/cart/update/${productId}?quantity=${quantity}`;
    const token = localStorage.getItem('token');
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update cart item: ${response.status}`);
    }
    
    return await response.text(); // Backend returns text, not JSON
  }

  // Note: Backend doesn't have update cart endpoint
  // async updateCartItem(productId, quantity) {
  //   return this.request('/cart/update', {
  //     method: 'PUT',
  //     body: JSON.stringify({ productId, quantity }),
  //   });
  // }

  async removeFromCart(productId) {
    const url = `${this.baseURL}/cart/remove/${productId}`;
    const token = localStorage.getItem('token');

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to remove item from cart: ${response.status}`);
    }

    return await response.text(); // Backend returns text, not JSON
  }

  async clearCart() {
    const url = `${this.baseURL}/cart/clear`;
    const token = localStorage.getItem('token');

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to clear cart: ${response.status}`);
    }

    return await response.text(); // Backend returns text, not JSON
  }

  // Order APIs
  async placeOrder() {
    const url = `${this.baseURL}/orders/place`;
    const token = localStorage.getItem('token');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to place order: ${response.status}`);
    }
    
    return await response.text(); // Backend returns text, not JSON
  }

  async getOrderHistory() {
    return this.request('/orders/history');
  }

  async getOrder(orderId) {
    return this.request(`/orders/${orderId}`);
  }

  // Admin APIs (using existing endpoints with role checking)

  async addProduct(productData) {
    try {


      const result = await this.request('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });



      return result;
    } catch (error) {

      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        throw new Error('Access denied. Please ensure you are logged in as an admin.');
      }
      throw error;
    }
  }

  async updateProduct(productId, productData) {
    try {
      console.log('🔄 API: Updating product with ID:', productId);
      console.log('📝 API: Update data:', productData);
      console.log('🖼️ API: Image URL being sent:', productData.imageUrl);
      console.log('📏 API: Image URL length:', productData.imageUrl ? productData.imageUrl.length : 'null');

      const result = await this.request(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });

      console.log('✅ API: Product updated successfully:', result);
      console.log('🔗 API: Returned image URL:', result.imageUrl);

      return result;
    } catch (error) {
      console.error('❌ API: Failed to update product:', error);
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        throw new Error('Access denied. Please ensure you are logged in as an admin.');
      }
      throw error;
    }
  }

  async deleteProduct(productId) {
    return this.request(`/products/${productId}`, {
      method: 'DELETE',
    });
  }

  async getAllOrders() {
    try {
      // Try admin endpoint first for comprehensive order data
      const orders = await this.request('/orders/admin/all');

      // Normalize order data structure for consistent access
      return orders.map(order => ({
        ...order,
        // Ensure consistent property names
        orderItems: order.items || order.orderItems || [],
        items: order.items || order.orderItems || [],
        // Ensure user information is available
        user: order.user || {
          id: order.userId,
          email: order.userEmail || order.email,
          name: order.userName || order.name || 'Unknown User',
          role: order.userRole || 'ROLE_USER',
          phone: order.user?.phone || 'N/A',
          address: order.user?.address || 'N/A',
          city: order.user?.city || 'N/A',
          state: order.user?.state || 'N/A',
          zipCode: order.user?.zipCode || 'N/A',
          country: order.user?.country || 'N/A'
        },
        // Ensure order date is available
        orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
        // Ensure status is available
        status: order.status || 'placed',
        // Ensure total amount is available
        totalAmount: order.totalAmount || 0
      }));
    } catch (error) {
      console.error('Failed to get admin orders:', error);
      // Fallback to user orders if admin endpoint fails
      try {
        const fallbackOrders = await this.request('/orders/history');
        return this.normalizeOrderData(fallbackOrders);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw new Error(`Failed to load orders: ${error.message}`);
      }
    }
  }

  // Helper method to normalize order data
  normalizeOrderData(orders) {
    return orders.map(order => ({
      ...order,
      orderItems: order.items || order.orderItems || [],
      items: order.items || order.orderItems || [],
      user: order.user || {
        id: order.userId,
        email: order.userEmail || order.email,
        name: order.userName || order.name || 'Unknown User',
        role: order.userRole || 'ROLE_USER',
        phone: order.user?.phone || 'N/A',
        address: order.user?.address || 'N/A'
      },
      orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
      status: order.status || 'placed',
      totalAmount: order.totalAmount || 0
    }));
  }

  // Admin: Update order status
  async updateOrderStatus(orderId, status) {
    try {
      console.log(`Updating order ${orderId} status to: ${status}`);

      const response = await this.request(`/orders/admin/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        message: `Order status updated to ${status}`,
        order: response
      };
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }

  // Admin: Get order by ID
  async getOrderById(orderId) {
    try {
      return await this.request(`/orders/admin/${orderId}`);
    } catch (error) {
      console.error('Failed to get order:', error);
      throw new Error(`Failed to get order: ${error.message}`);
    }
  }

  async getAllUsers() {
    try {
      // Use the new admin endpoint to get all registered users with statistics
      const usersWithStats = await this.request('/admin/users/with-stats');

      // Transform the data to match the expected format
      const users = usersWithStats.map(userStats => ({
        id: userStats.userId,
        name: userStats.userName,
        email: userStats.userEmail,
        role: userStats.userRole,
        phone: userStats.phone || 'N/A',
        address: userStats.address || 'N/A',
        city: userStats.city || 'N/A',
        state: userStats.state || 'N/A',
        zipCode: userStats.zipCode || 'N/A',
        country: userStats.country || 'N/A',
        totalOrders: userStats.totalOrders,
        totalSpent: userStats.totalSpent,
        averageOrderValue: userStats.averageOrderValue,
        lastOrderDate: userStats.lastOrderDate,
        joinDate: userStats.joinDate,
        status: userStats.userActive ? 'active' : 'inactive',
        active: userStats.userActive,
        createdAt: userStats.joinDate,
        updatedAt: userStats.lastUpdated,
        orderStatusBreakdown: userStats.orderStatusBreakdown
      }));

      console.log(`✅ Loaded ${users.length} registered users with comprehensive statistics`);
      return users;
    } catch (error) {
      console.error('Failed to get users from admin endpoint:', error);

      // Fallback to the old method if the new endpoint fails
      try {
        console.log('🔄 Falling back to extracting users from orders');
        return await this.getAllUsersFromOrders();
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError);
        return [];
      }
    }
  }

  // Fallback method - extract users from orders (old implementation)
  async getAllUsersFromOrders() {
    try {
      const orders = await this.getAllOrders();
      const userMap = new Map();

      orders.forEach(order => {
        const user = order.user;
        const userId = user?.id;

        if (userId && !userMap.has(userId)) {
          userMap.set(userId, {
            id: userId,
            email: user.email || 'No email',
            name: user.name || 'Unknown User',
            role: user.role || 'ROLE_USER',
            totalOrders: 0,
            totalSpent: 0,
            lastOrderDate: order.orderDate,
            joinDate: order.orderDate,
            status: 'active',
            phone: user.phone || 'N/A',
            address: user.address || 'N/A'
          });
        }
      });

      orders.forEach(order => {
        const userId = order.user?.id;
        if (userId && userMap.has(userId)) {
          const user = userMap.get(userId);
          user.totalOrders++;
          user.totalSpent += order.totalAmount || 0;

          const orderDate = new Date(order.orderDate);
          const lastDate = new Date(user.lastOrderDate);
          if (orderDate > lastDate) {
            user.lastOrderDate = order.orderDate;
          }

          const joinDate = new Date(user.joinDate);
          if (orderDate < joinDate) {
            user.joinDate = order.orderDate;
          }
        }
      });

      const users = Array.from(userMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
      console.log(`⚠️ Fallback: Loaded ${users.length} users from ${orders.length} orders`);
      return users;
    } catch (error) {
      console.error('Failed to get users from orders:', error);
      return [];
    }
  }

  // Admin: Update user status
  async updateUserStatus(userId, active) {
    try {
      console.log(`Updating user ${userId} status to: ${active}`);

      const response = await this.request(`/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ active }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        message: `User status updated to ${active ? 'active' : 'inactive'}`,
        user: response
      };
    } catch (error) {
      console.error('Failed to update user status:', error);
      throw new Error(`Failed to update user status: ${error.message}`);
    }
  }

  // Admin: Update user role
  async updateUserRole(userId, role) {
    try {
      console.log(`Updating user ${userId} role to: ${role}`);

      const response = await this.request(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        message: `User role updated to ${role}`,
        user: response
      };
    } catch (error) {
      console.error('Failed to update user role:', error);
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  }

  // Admin: Get user statistics
  async getUserStatistics(userId) {
    try {
      const stats = await this.request(`/admin/users/${userId}/stats`);
      return stats;
    } catch (error) {
      console.error('Failed to get user statistics:', error);
      throw new Error(`Failed to get user statistics: ${error.message}`);
    }
  }

  // Admin: Get user by ID
  async getUserById(userId) {
    try {
      return await this.request(`/admin/users/${userId}`);
    } catch (error) {
      console.error('Failed to get user:', error);
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      console.log(`Updating order status: Order ${orderId} -> ${status}`);

      // Use the new admin endpoint to update order status
      const response = await this.request(`/orders/admin/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        message: `Order ${orderId} status updated to ${status}`,
        orderId,
        newStatus: status,
        timestamp: new Date().toISOString(),
        order: response
      };
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }

  // Enhanced product retrieval with better error handling
  async getProduct(id) {
    try {
      const product = await this.request(`/products/${id}`);

      // Ensure all required fields are present
      return {
        ...product,
        name: product.name || 'Unnamed Product',
        price: product.price || 0,
        description: product.description || 'No description available',
        imageUrl: product.imageUrl || '',
        rating: product.rating || 0,
        available: product.available !== undefined ? product.available : true,
        flavor: product.flavor || 'Original',
        stockQuantity: product.stockQuantity || 0,
        category: product.category || 'MAKHANA',
        // Additional fields for better display
        shortDescription: product.shortDescription || product.description?.substring(0, 100) + '...' || '',
        reviewCount: product.reviewCount || 0,
        weight: product.weight || 'N/A',
        sku: product.sku || `SKU-${id}`,
        tags: product.tags || [],
        isPremium: product.isPremium || false,
        isFeatured: product.isFeatured || false,
        isNewArrival: product.isNewArrival || false
      };
    } catch (error) {
      console.error(`Failed to get product ${id}:`, error);
      throw error;
    }
  }

  // Coupon APIs
  async getAllCoupons() {
    return this.request('/coupons');
  }

  async getActiveCoupons() {
    return this.request('/coupons/active');
  }

  async getFirstTimeCoupons() {
    return this.request('/coupons/first-time');
  }

  async getCoupon(id) {
    return this.request(`/coupons/${id}`);
  }

  async getCouponByCode(code) {
    return this.request(`/coupons/code/${code}`);
  }

  async validateCoupon(code, amount, isFirstTimeUser = false) {
    return this.request(`/coupons/validate?code=${code}&amount=${amount}&firstTimeUser=${isFirstTimeUser}`);
  }

  async calculateDiscount(code, amount, isFirstTimeUser = false) {
    return this.request(`/coupons/calculate?code=${code}&amount=${amount}&firstTimeUser=${isFirstTimeUser}`);
  }

  async createCoupon(couponData) {
    return this.request('/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData),
    });
  }

  async updateCoupon(id, couponData) {
    return this.request(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(couponData),
    });
  }

  async deleteCoupon(id) {
    return this.request(`/coupons/${id}`, {
      method: 'DELETE',
    });
  }

  async incrementCouponUsage(code) {
    return this.request(`/coupons/increment-usage/${code}`, {
      method: 'POST',
    });
  }
}

export default new ApiService();
