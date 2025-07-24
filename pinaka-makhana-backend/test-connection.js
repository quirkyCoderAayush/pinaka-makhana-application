// Simple script to test backend connection
async function testBackendConnection() {
  const API_BASE_URL = 'http://localhost:8081/api';
  
  console.log('🔄 Testing backend connection...\n');
  
  // Test 1: Health check - Get products (public endpoint)
  try {
    console.log('1. Testing GET /api/products (public endpoint)');
    const response = await fetch(`${API_BASE_URL}/products`);
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const products = await response.json();
      console.log(`   ✅ Success! Found ${products.length} products`);
      console.log(`   Sample product:`, products[0] || 'No products found');
    } else {
      console.log(`   ❌ Failed: ${response.statusText}`);
    }
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
    console.log('   🔍 Is your backend running on port 8081?');
  }
  
  console.log('\n2. Testing POST /api/auth/register');
  try {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      isAdmin: false
    };
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log(`   ✅ Registration successful!`);
      console.log(`   Token received: ${result.token ? 'Yes' : 'No'}`);
    } else {
      const error = await response.text();
      console.log(`   ❌ Registration failed: ${error}`);
    }
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
  }
  
  console.log('\n🔍 Connection test complete!');
}

// Run the test
testBackendConnection();
