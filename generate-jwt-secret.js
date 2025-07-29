#!/usr/bin/env node

/**
 * JWT Secret Generator for Pinaka Makhana Application
 * Generates a secure 256-bit (32-byte) secret key for JWT signing
 */

const crypto = require('crypto');

function generateJWTSecret() {
    // Generate 32 random bytes (256 bits)
    const secret = crypto.randomBytes(32);
    
    // Convert to base64 for easy storage
    const base64Secret = secret.toString('base64');
    
    console.log('🔐 JWT Secret Generator for Pinaka Makhana Application');
    console.log('HAR HAR MAHADEV! 🙏\n');
    
    console.log('Generated JWT Secret (Base64):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(base64Secret);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📋 Instructions:');
    console.log('1. Copy the secret above');
    console.log('2. In Render dashboard, add environment variable:');
    console.log('   Key: JWT_SECRET');
    console.log('   Value: ' + base64Secret);
    console.log('\n⚠️  IMPORTANT: Keep this secret secure and never share it publicly!\n');
    
    console.log('🎯 Secret Details:');
    console.log(`   Length: ${base64Secret.length} characters`);
    console.log(`   Entropy: 256 bits`);
    console.log(`   Format: Base64 encoded`);
    console.log('\n✅ This secret is cryptographically secure for production use.');
}

// Run the generator
generateJWTSecret();
