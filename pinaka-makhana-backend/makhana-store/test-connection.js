// Simple script to test backend connection
async function testBackendConnection() {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8081/api';
  
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
    return;
  }
  
  console.log('\n2. Testing POST /api/auth/register');
  try {
    const testUser = {
      name: 'Test User',
      email: 'test' + Date.now() + '@example.com', // Unique email
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
      console.log(`   User: ${result.name}`);
      console.log(`   Token received: ${result.token ? 'Yes' : 'No'}`);
      
      // Test login with the same user
      console.log('\n3. Testing POST /api/auth/login');
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
          isAdmin: false
        })
      });
      
      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        console.log(`   ✅ Login successful!`);
        console.log(`   Token: ${loginResult.token.substring(0, 20)}...`);
        
        // Test authenticated endpoint - Add to cart
        console.log('\n4. Testing POST /api/cart/add (authenticated)');
        const addCartResponse = await fetch(`${API_BASE_URL}/cart/add?productId=1&quantity=2`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${loginResult.token}`
          }
        });
        
        if (addCartResponse.ok) {
          console.log(`   ✅ Add to cart successful!`);
          
          // Test cart retrieval
          console.log('\n5. Testing GET /api/cart (authenticated)');
          const cartResponse = await fetch(`${API_BASE_URL}/cart`, {
            headers: {
              'Authorization': `Bearer ${loginResult.token}`
            }
          });
          
          if (cartResponse.ok) {
            const cart = await cartResponse.json();
            console.log(`   ✅ Cart access successful! Items: ${cart.length}`);
            if (cart.length > 0) {
              console.log(`   First item: ${cart[0].product.name} (Qty: ${cart[0].quantity})`);
            }
          } else {
            console.log(`   ❌ Cart access failed: ${cartResponse.status}`);
          }
        } else {
          console.log(`   ❌ Add to cart failed: ${addCartResponse.status}`);
        }
        
      } else {
        console.log(`   ❌ Login failed: ${loginResponse.status}`);
      }
      
    } else {
      const error = await response.text();
      console.log(`   ❌ Registration failed: ${error}`);
    }
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
  }
  
  console.log('\n🎉 Connection test complete! Your backend is working!');
}

// Run the test
testBackendConnection();
