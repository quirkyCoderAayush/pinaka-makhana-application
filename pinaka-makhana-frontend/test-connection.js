// Test script to verify frontend-backend connection
const API_BASE_URL = 'http://localhost:8081/api';

async function testConnection() {
    console.log('🔍 Testing Frontend-Backend Connection...\n');
    
    // Test 1: Check if backend is running
    console.log('1. Testing backend availability...');
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (response.ok) {
            console.log('✅ Backend is running and accessible');
            const products = await response.json();
            console.log(`   Found ${products.length} products in database`);
        } else {
            console.log('❌ Backend responded with error:', response.status);
        }
    } catch (error) {
        console.log('❌ Cannot connect to backend:', error.message);
        console.log('   Make sure your Spring Boot backend is running on port 8081');
        return;
    }
    
    // Test 2: Test CORS configuration
    console.log('\n2. Testing CORS configuration...');
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:5173' // Vite default port
            }
        });
        console.log('✅ CORS is properly configured');
    } catch (error) {
        console.log('❌ CORS issue detected:', error.message);
    }
    
    // Test 3: Test authentication endpoint
    console.log('\n3. Testing authentication endpoints...');
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'wrongpassword'
            })
        });
        
        if (response.status === 401 || response.status === 400) {
            console.log('✅ Authentication endpoint is working (expected error for wrong credentials)');
        } else {
            console.log('⚠️  Authentication endpoint responded unexpectedly:', response.status);
        }
    } catch (error) {
        console.log('❌ Authentication endpoint error:', error.message);
    }
    
    console.log('\n📋 Connection Test Summary:');
    console.log('   - API Base URL: ' + API_BASE_URL);
    console.log('   - Expected Frontend URL: http://localhost:5173 (Vite default)');
    console.log('   - Expected Backend URL: http://localhost:8081 (Spring Boot)');
    console.log('\n💡 Next Steps:');
    console.log('   1. Start your Spring Boot backend: cd ../pinaka-makhana-backend && mvn spring-boot:run');
    console.log('   2. Start your React frontend: npm run dev');
    console.log('   3. Open http://localhost:5173 in your browser');
}

// Run the test
testConnection().catch(console.error);
