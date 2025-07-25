#!/bin/bash

# Pinaka Makhana Application - Improvement Setup Script
# This script sets up all the new dependencies and configurations

echo "🚀 Setting up Pinaka Makhana Application Improvements..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
}

# Check if Java is installed
check_java() {
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1)
        print_success "Java is installed: $JAVA_VERSION"
    else
        print_error "Java is not installed. Please install Java 17+ first."
        exit 1
    fi
}

# Check if Maven is installed
check_maven() {
    if command -v mvn &> /dev/null; then
        MVN_VERSION=$(mvn --version | head -n 1)
        print_success "Maven is installed: $MVN_VERSION"
    else
        print_error "Maven is not installed. Please install Maven first."
        exit 1
    fi
}

# Setup Frontend
setup_frontend() {
    print_status "Setting up Frontend improvements..."
    
    cd pinaka-makhana-frontend/makhana-store-frontend || {
        print_error "Frontend directory not found!"
        exit 1
    }
    
    print_status "Installing new frontend dependencies..."
    
    # Install new dependencies
    npm install @headlessui/react@^1.7.17 \
                @heroicons/react@^2.0.18 \
                framer-motion@^10.16.4 \
                react-hot-toast@^2.4.1 \
                react-intersection-observer@^9.5.2 \
                swiper@^11.0.5 \
                lucide-react@^0.294.0 \
                react-spring@^9.7.3 \
                react-use-gesture@^9.1.3 \
                embla-carousel-react@^8.0.0 \
                react-select@^5.8.0 \
                react-loading-skeleton@^3.3.1 \
                react-infinite-scroll-component@^6.1.0 \
                react-image-gallery@^1.3.0 \
                react-star-ratings@^2.3.0 \
                react-share@^4.4.1
    
    if [ $? -eq 0 ]; then
        print_success "Frontend dependencies installed successfully!"
    else
        print_error "Failed to install frontend dependencies!"
        exit 1
    fi
    
    # Install Tailwind CSS plugins
    print_status "Installing Tailwind CSS plugins..."
    npm install @tailwindcss/forms @tailwindcss/aspect-ratio
    
    if [ $? -eq 0 ]; then
        print_success "Tailwind plugins installed successfully!"
    else
        print_warning "Failed to install Tailwind plugins (not critical)"
    fi
    
    # Try to install missing Google Fonts
    print_status "Setting up Google Fonts..."
    
    cd ../..
}

# Setup Backend
setup_backend() {
    print_status "Setting up Backend improvements..."
    
    cd pinaka-makhana-backend/makhana-store || {
        print_error "Backend directory not found!"
        exit 1
    }
    
    print_status "Building backend with Maven..."
    mvn clean compile
    
    if [ $? -eq 0 ]; then
        print_success "Backend built successfully!"
    else
        print_error "Failed to build backend!"
        exit 1
    fi
    
    cd ../..
}

# Create environment files
create_env_files() {
    print_status "Creating environment configuration files..."
    
    # Frontend .env
    if [ ! -f pinaka-makhana-frontend/makhana-store-frontend/.env ]; then
        cat > pinaka-makhana-frontend/makhana-store-frontend/.env << EOF
# Frontend Environment Variables
REACT_APP_API_BASE_URL=http://localhost:8081/api
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_here
REACT_APP_PAYTM_MERCHANT_ID=your_paytm_merchant_id_here
REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id_here
REACT_APP_ENVIRONMENT=development
EOF
        print_success "Frontend .env file created"
    else
        print_warning "Frontend .env file already exists"
    fi
    
    # Backend application-dev.properties
    if [ ! -f pinaka-makhana-backend/makhana-store/src/main/resources/application-dev.properties ]; then
        cat > pinaka-makhana-backend/makhana-store/src/main/resources/application-dev.properties << EOF
# Development Configuration
spring.profiles.active=dev
server.port=8081

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/pinaka-db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=your_password_here
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Configuration
jwt.secret=your_jwt_secret_here_make_it_long_and_secure
jwt.expiration=86400000

# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Logging Configuration
logging.level.com.pinaka.makhana=DEBUG
EOF
        print_success "Backend development properties created"
    else
        print_warning "Backend development properties already exist"
    fi
}

# Create Docker files
create_docker_files() {
    print_status "Creating Docker configuration files..."
    
    # Frontend Dockerfile
    if [ ! -f pinaka-makhana-frontend/makhana-store-frontend/Dockerfile ]; then
        cat > pinaka-makhana-frontend/makhana-store-frontend/Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
EOF
        print_success "Frontend Dockerfile created"
    fi
    
    # Backend Dockerfile
    if [ ! -f pinaka-makhana-backend/makhana-store/Dockerfile ]; then
        cat > pinaka-makhana-backend/makhana-store/Dockerfile << EOF
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 8081

CMD ["java", "-jar", "app.jar"]
EOF
        print_success "Backend Dockerfile created"
    fi
    
    # Docker Compose
    if [ ! -f docker-compose.yml ]; then
        cat > docker-compose.yml << EOF
version: '3.8'

services:
  frontend:
    build: 
      context: ./pinaka-makhana-frontend/makhana-store-frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_BASE_URL=http://localhost:8081/api
    depends_on:
      - backend
    networks:
      - app-network

  backend:
    build:
      context: ./pinaka-makhana-backend/makhana-store
    ports:
      - "8081:8081"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/pinaka-db
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=rootpassword
    depends_on:
      - mysql
    networks:
      - app-network

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=pinaka-db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mysql_data:
EOF
        print_success "Docker Compose file created"
    fi
}

# Create development scripts
create_dev_scripts() {
    print_status "Creating development scripts..."
    
    # Start development script
    cat > start-dev.sh << EOF
#!/bin/bash

echo "🚀 Starting Pinaka Makhana Development Environment..."

# Start backend
echo "Starting backend..."
cd pinaka-makhana-backend/makhana-store
mvn spring-boot:run &
BACKEND_PID=\$!

# Wait a bit for backend to start
sleep 10

# Start frontend
echo "Starting frontend..."
cd ../../pinaka-makhana-frontend/makhana-store-frontend
npm run dev &
FRONTEND_PID=\$!

echo "✅ Development environment started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8081"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "kill \$BACKEND_PID \$FRONTEND_PID; exit" INT
wait
EOF
    
    chmod +x start-dev.sh
    print_success "Development start script created"
    
    # Build production script
    cat > build-prod.sh << EOF
#!/bin/bash

echo "🏗️ Building Pinaka Makhana for Production..."

# Build backend
echo "Building backend..."
cd pinaka-makhana-backend/makhana-store
mvn clean package -DskipTests

if [ \$? -eq 0 ]; then
    echo "✅ Backend built successfully!"
else
    echo "❌ Backend build failed!"
    exit 1
fi

# Build frontend
echo "Building frontend..."
cd ../../pinaka-makhana-frontend/makhana-store-frontend
npm run build

if [ \$? -eq 0 ]; then
    echo "✅ Frontend built successfully!"
else
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "🎉 Production build completed!"
echo "Backend JAR: pinaka-makhana-backend/makhana-store/target/"
echo "Frontend dist: pinaka-makhana-frontend/makhana-store-frontend/dist/"
EOF
    
    chmod +x build-prod.sh
    print_success "Production build script created"
}

# Create README updates
create_readme_updates() {
    print_status "Creating updated README files..."
    
    # Update main README
    if [ ! -f README.md ]; then
        cat > README.md << EOF
# 🥜 Pinaka Makhana Store - Premium E-commerce Platform

A modern, full-stack e-commerce application for premium makhana (fox nuts) products, built with React and Spring Boot.

## ✨ Features

### 🛍️ Customer Features
- Modern responsive design with animations
- Product catalog with advanced filtering
- Product comparison tool
- Shopping cart and checkout
- User authentication and profiles
- Order tracking and history
- Reviews and ratings
- Wishlist functionality
- Coupon and discount system

### 👨‍💼 Admin Features
- Comprehensive admin dashboard
- Product management with rich data
- Order management and tracking
- User management
- Coupon management
- Analytics and reporting

### 🎨 UI/UX Enhancements
- Framer Motion animations
- Modern component library
- Responsive design
- Loading skeletons
- Toast notifications
- Advanced interactions

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Java 17+
- Maven 3.6+
- MySQL 8.0+

### Development Setup
\`\`\`bash
# Clone the repository
git clone <your-repo-url>
cd pinaka-makhana-application

# Run setup script
chmod +x setup-improvements.sh
./setup-improvements.sh

# Start development environment
./start-dev.sh
\`\`\`

### Manual Setup

#### Frontend
\`\`\`bash
cd pinaka-makhana-frontend/makhana-store-frontend
npm install
npm run dev
\`\`\`

#### Backend
\`\`\`bash
cd pinaka-makhana-backend/makhana-store
mvn clean install
mvn spring-boot:run
\`\`\`

## 🏗️ Architecture

### Frontend Stack
- **React 19** - UI framework
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Context API** - State management

### Backend Stack
- **Spring Boot 3.5** - Application framework
- **Spring Security** - Authentication & authorization
- **JPA/Hibernate** - Data persistence
- **MySQL** - Database
- **JWT** - Token-based authentication

## 📱 Responsive Design

The application is fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📟 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1440px+)

## 🎯 Performance

- ⚡ Fast loading with code splitting
- 🎨 Smooth animations at 60fps
- 📦 Optimized bundle size
- 🖼️ Lazy-loaded images
- 💾 Efficient state management

## 🛡️ Security

- 🔐 JWT-based authentication
- 🛡️ CORS protection
- 🔒 Input validation
- 🚫 XSS protection
- 🛑 SQL injection prevention

## 📊 Business Features

- 💰 Dynamic pricing and discounts
- 📈 Sales analytics
- 👥 Customer segmentation
- 📧 Email notifications
- 🏷️ Coupon management
- ⭐ Review system

## 🌟 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React team for the amazing framework
- Spring Boot team for the robust backend framework
- Tailwind CSS for the utility-first CSS framework
- All the open-source contributors

---

Made with ❤️ for premium makhana lovers
EOF
        print_success "Main README created"
    fi
}

# Main setup function
main() {
    print_status "Starting Pinaka Makhana Application Setup..."
    
    # Check prerequisites
    check_nodejs
    check_java
    check_maven
    
    # Setup components
    setup_frontend
    setup_backend
    create_env_files
    create_docker_files
    create_dev_scripts
    create_readme_updates
    
    print_success "🎉 Setup completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Update the .env files with your actual configuration"
    echo "2. Set up your MySQL database"
    echo "3. Run './start-dev.sh' to start the development environment"
    echo "4. Visit http://localhost:3000 to see your enhanced application"
    echo ""
    print_warning "Don't forget to:"
    echo "- Configure your payment gateway keys"
    echo "- Set up email SMTP settings"
    echo "- Update database credentials"
    echo "- Review and customize the new features"
}

# Run main function
main