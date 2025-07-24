// Complete frontend-backend integration test
async function testFullFlow() {
  const API_BASE_URL = 'http://localhost:8081/api';
  
  console.log('🚀 Testing Full Frontend-Backend Integration...\n');
  
  // Test 1: Registration with correct structure
  console.log('1. Testing Registration Flow');
  const uniqueEmail = 'user' + Date.now() + '@test.com';
  const registrationData = {
    name: 'John Doe', // Backend expects 'name'
    email: uniqueEmail,
    password: 'password123',
    isAdmin: false
  };
  
  try {
    const regResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });
    
    if (regResponse.ok) {
      const regResult = await regResponse.json();
      console.log('   ✅ Registration successful!');
      console.log('   📊 Response structure:', Object.keys(regResult));
      console.log('   🔑 Token received:', regResult.token ? 'Yes' : 'No');
      console.log('   👤 User name:', regResult.name);
      console.log('   🔐 Role:', regResult.role);
      
      // Test 2: Login with registered user
      console.log('\n2. Testing Login Flow');
      const loginData = {
        email: uniqueEmail, // Backend uses email for login
        password: 'password123'
      };
      
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        console.log('   ✅ Login successful!');
        console.log('   🔑 Token:', loginResult.token.substring(0, 20) + '...');
        
        // Test 3: Authenticated requests
        console.log('\n3. Testing Authenticated Requests');
        const cartResponse = await fetch(`${API_BASE_URL}/cart`, {
          headers: { 'Authorization': `Bearer ${loginResult.token}` }
        });
        
        if (cartResponse.ok) {
          console.log('   ✅ Cart access successful!');
          
          // Test 4: Add to cart
          console.log('\n4. Testing Add to Cart');
          const addCartResponse = await fetch(`${API_BASE_URL}/cart/add?productId=1&quantity=2`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${loginResult.token}` }
          });
          
          if (addCartResponse.ok) {
            console.log('   ✅ Add to cart successful!');
            
            // Test 5: Get updated cart
            const updatedCartResponse = await fetch(`${API_BASE_URL}/cart`, {
              headers: { 'Authorization': `Bearer ${loginResult.token}` }
            });
            
            if (updatedCartResponse.ok) {
              const cartItems = await updatedCartResponse.json();
              console.log('   ✅ Cart retrieved successfully!');
              console.log('   📦 Cart items:', cartItems.length);
              if (cartItems.length > 0) {
                console.log('   🛒 Sample item:', cartItems[0].product?.name || 'Unknown');
              }
            }
          } else {
            console.log('   ❌ Add to cart failed:', addCartResponse.status);
          }
          
        } else {
          console.log('   ❌ Cart access failed:', cartResponse.status);
        }
        
      } else {
        const loginError = await loginResponse.text();
        console.log('   ❌ Login failed:', loginError);
      }
      
    } else {
      const regError = await regResponse.text();
      console.log('   ❌ Registration failed:', regError);
    }
    
  } catch (error) {
    console.log('   ❌ Connection failed:', error.message);
    console.log('   🔍 Make sure backend is running on port 8081');
  }
  
  console.log('\n🎯 Frontend Integration Checklist:');
  console.log('   📝 Update Register form to send: {fullName -> name, email, password}');
  console.log('   🔐 Update Login to use email (not username)');  
  console.log('   📊 Update AuthContext to handle backend response: {token, name, role}');
  console.log('   🛒 Ensure cart operations use email-based authentication');
  console.log('\n🎉 Test complete! Check results above.');
}

// Run the test
testFullFlow();
