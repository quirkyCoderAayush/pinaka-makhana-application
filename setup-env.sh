#!/bin/bash

echo "🚀 Setting up environment variables for Pinaka Makhana Application"
echo "================================================================"

# Frontend setup
echo ""
echo "📁 Setting up Frontend environment..."
if [ ! -f "pinaka-makhana-frontend/makhana-store-frontend/.env" ]; then
    echo "Creating frontend .env file..."
    cat > pinaka-makhana-frontend/makhana-store-frontend/.env << EOF
# Frontend Environment Variables
# API Base URL for local development
VITE_API_BASE_URL=http://localhost:8081/api
EOF
    echo "✅ Frontend .env file created"
else
    echo "⚠️  Frontend .env file already exists"
fi

# Backend setup
echo ""
echo "📁 Setting up Backend environment..."
if [ ! -f "pinaka-makhana-backend/makhana-store/.env" ]; then
    echo "Creating backend .env file..."
    cat > pinaka-makhana-backend/makhana-store/.env << EOF
# Backend Environment Variables for Local Development

# Server Configuration
SERVER_PORT=8081

# JWT Secret (generate a new one for production)
JWT_SECRET=3gDmPjc+nuej/Tnen2sGFr27s/o4B52Ki1Th43rf18sP1dHziwRdoBPg6EmDKi3PA/SvYTI6gnuQu3ZHZcOCFQ==

# Database Configuration
DATABASE_URL=jdbc:mysql://localhost:3306/pinaka-db
DATABASE_USERNAME=root
DATABASE_PASSWORD=2023Sannu
HIBERNATE_DDL_AUTO=update

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS=true
EOF
    echo "✅ Backend .env file created"
else
    echo "⚠️  Backend .env file already exists"
fi

echo ""
echo "🎉 Environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update the database password in pinaka-makhana-backend/makhana-store/.env"
echo "2. Update email credentials in pinaka-makhana-backend/makhana-store/.env"
echo "3. Start your MySQL database"
echo "4. Run backend: cd pinaka-makhana-backend/makhana-store && ./mvnw spring-boot:run"
echo "5. Run frontend: cd pinaka-makhana-frontend/makhana-store-frontend && npm run dev"
echo ""
echo "📖 For deployment instructions, see DEPLOYMENT.md"