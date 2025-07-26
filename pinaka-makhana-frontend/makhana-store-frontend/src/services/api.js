const API_BASE_URL = 'http://localhost:8081/api';

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
        const errorData = await response.json().catch(() => ({ message: 'Something went wrong' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
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
    return this.request('/products');
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

  // Update cart item quantity by removing and re-adding
  async updateCartItemQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      return this.removeFromCart(productId);
    }
    
    // Remove existing item first
    await this.removeFromCart(productId);
    // Add with new quantity
    return this.addToCart(productId, newQuantity);
  }

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
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId, productData) {
    return this.request(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(productId) {
    return this.request(`/products/${productId}`, {
      method: 'DELETE',
    });
  }

  async getAllOrders() {
    // Since /admin/orders doesn't exist, we'll use order history for now
    // This will be limited but functional
    return this.request('/orders/history');
  }

  async getAllUsers() {
    // Since /admin/users doesn't exist, we'll extract users from orders
    try {
      const orders = await this.request('/orders/history');
      const userMap = new Map();
      
      orders.forEach(order => {
        const userId = order.user?.id || order.userId;
        const userEmail = order.user?.email || order.userEmail;
        const userName = order.user?.name || order.userName || 'Unknown User';
        
        if (userId && !userMap.has(userId)) {
          userMap.set(userId, {
            id: userId,
            email: userEmail,
            name: userName,
            role: order.user?.role || 'ROLE_USER',
            totalOrders: 0,
            totalSpent: 0,
            lastOrderDate: order.orderDate || order.createdAt
          });
        }
      });

      // Calculate stats for each user
      orders.forEach(order => {
        const userId = order.user?.id || order.userId;
        if (userId && userMap.has(userId)) {
          const user = userMap.get(userId);
          user.totalOrders++;
          user.totalSpent += order.totalAmount || 0;
          
          const orderDate = new Date(order.orderDate || order.createdAt);
          const lastDate = new Date(user.lastOrderDate);
          if (orderDate > lastDate) {
            user.lastOrderDate = order.orderDate || order.createdAt;
          }
        }
      });
      
      return Array.from(userMap.values());
    } catch (error) {
      console.error('Failed to get users from orders:', error);
      return [];
    }
  }

  async updateOrderStatus(orderId, status) {
    // This endpoint doesn't exist in backend, so we'll return a promise that resolves
    // In a real scenario, you'd implement this endpoint in the backend
    return Promise.resolve({ message: 'Order status update not implemented in backend yet' });
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
