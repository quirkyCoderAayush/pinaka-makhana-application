#!/bin/bash

# 🚀 Pinaka Makhana Application - Deployment Script
# HAR HAR MAHADEV! 🙏

echo "🚀 Pinaka Makhana Application - Free Deployment Setup"
echo "HAR HAR MAHADEV! 🙏"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -d "pinaka-makhana-backend" ] || [ ! -d "pinaka-makhana-frontend" ]; then
    print_error "Please run this script from the root of your pinaka-makhana-application repository"
    exit 1
fi

print_step "Checking deployment readiness..."

# Check backend files
if [ -f "pinaka-makhana-backend/makhana-store/render.yaml" ]; then
    print_success "Backend render.yaml configuration found"
else
    print_error "Backend render.yaml configuration missing"
    exit 1
fi

# Check frontend files
if [ -f "pinaka-makhana-frontend/makhana-store-frontend/vercel.json" ]; then
    print_success "Frontend vercel.json configuration found"
else
    print_error "Frontend vercel.json configuration missing"
    exit 1
fi

# Check health controller
if [ -f "pinaka-makhana-backend/makhana-store/src/main/java/com/pinaka/makhana/controller/HealthController.java" ]; then
    print_success "Health controller found"
else
    print_error "Health controller missing"
    exit 1
fi

print_success "All deployment files are ready!"
echo ""

print_step "Deployment Instructions:"
echo ""
echo "🗄️  STEP 1: Setup PlanetScale Database"
echo "   1. Go to https://planetscale.com/ and create account"
echo "   2. Create database named 'pinaka-db'"
echo "   3. Get connection details (Host, Username, Password)"
echo ""

echo "⚙️  STEP 2: Deploy Backend to Render"
echo "   1. Go to https://dashboard.render.com/"
echo "   2. Click 'New' → 'Web Service'"
echo "   3. Connect GitHub repository"
echo "   4. Root Directory: pinaka-makhana-backend/makhana-store"
echo "   5. Build Command: mvn clean package -DskipTests"
echo "   6. Start Command: java -jar target/makhana-store-0.0.1-SNAPSHOT.jar"
echo "   7. Add environment variables:"
echo "      - DATABASE_URL=jdbc:mysql://aws.connect.psdb.cloud/pinaka-db?sslMode=VERIFY_IDENTITY"
echo "      - DATABASE_USERNAME=[your-planetscale-username]"
echo "      - DATABASE_PASSWORD=[your-planetscale-password]"
echo "      - JWT_SECRET=[generate-strong-256-bit-secret]"
echo "      - SERVER_PORT=10000"
echo "      - HIBERNATE_DDL_AUTO=update"
echo "      - APP_UPLOAD_DIR=/tmp/uploads/images/"
echo ""

echo "🎨 STEP 3: Deploy Frontend to Vercel"
echo "   1. Go to https://vercel.com/dashboard"
echo "   2. Click 'New Project'"
echo "   3. Import GitHub repository"
echo "   4. Root Directory: pinaka-makhana-frontend/makhana-store-frontend"
echo "   5. Framework: Vite"
echo "   6. Build Command: npm run build"
echo "   7. Output Directory: dist"
echo "   8. Add environment variable:"
echo "      - VITE_API_BASE_URL=https://[your-backend-app].onrender.com/api"
echo ""

echo "🎯 Expected URLs:"
echo "   Frontend: https://[your-app].vercel.app"
echo "   Backend:  https://[your-backend-app].onrender.com"
echo ""

print_success "Deployment setup complete! Follow the instructions above."
print_warning "Note: First backend load may take 30-60 seconds (free tier limitation)"
echo ""
echo "🎉 HAR HAR MAHADEV! Your Pinaka Makhana application will be live soon! 🌍"
