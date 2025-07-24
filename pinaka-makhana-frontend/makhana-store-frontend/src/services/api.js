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
}

export default new ApiService();
