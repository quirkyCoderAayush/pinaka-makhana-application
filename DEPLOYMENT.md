# Deployment Guide for Pinaka Makhana Application

This guide covers deploying your full-stack application to free platforms with proper environment variable configuration.

## 🏗️ Project Structure
```
pinaka-makhana-application/
├── pinaka-makhana-frontend/makhana-store-frontend/ (React + Vite)
└── pinaka-makhana-backend/makhana-store/ (Spring Boot)
```

## 🚀 Deployment Targets

### Frontend: Vercel (Free)
- **URL**: https://vercel.com
- **Features**: Automatic deployments from GitHub, custom domains, SSL

### Backend: Render (Free)
- **URL**: https://render.com
- **Features**: Free tier with 750 hours/month, automatic deployments

### Database: PlanetScale (Free)
- **URL**: https://planetscale.com
- **Features**: MySQL-compatible, free tier with 1 database, 1 billion reads/month

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup

#### Frontend (.env)
```bash
# Local development
VITE_API_BASE_URL=http://localhost:8081/api

# Production (after backend deployment)
VITE_API_BASE_URL=https://your-backend-app.onrender.com/api
```

#### Backend (.env)
```bash
# Local development
SERVER_PORT=8081
JWT_SECRET=your-jwt-secret-here
DATABASE_URL=jdbc:mysql://localhost:3306/pinaka-db
DATABASE_USERNAME=root
DATABASE_PASSWORD=your-local-password
HIBERNATE_DDL_AUTO=update
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS=true

# Production (example with PlanetScale)
# DATABASE_URL=jdbc:mysql://aws.connect.psdb.cloud/pinaka-db?sslMode=VERIFY_IDENTITY
# DATABASE_USERNAME=your-planetscale-username
# DATABASE_PASSWORD=your-planetscale-password
# HIBERNATE_DDL_AUTO=validate
```

## 🗄️ Database Setup (PlanetScale)

### 1. Create PlanetScale Account
1. Go to https://planetscale.com
2. Sign up with GitHub
3. Create a new database called `pinaka-db`

### 2. Get Connection Details
1. Go to your database dashboard
2. Click "Connect"
3. Select "Java" and copy the connection details
4. Note down:
   - Host
   - Database name
   - Username
   - Password

### 3. Update Backend Environment Variables
Set these in Render dashboard:
```
DATABASE_URL=jdbc:mysql://aws.connect.psdb.cloud/pinaka-db?sslMode=VERIFY_IDENTITY
DATABASE_USERNAME=your-planetscale-username
DATABASE_PASSWORD=your-planetscale-password
HIBERNATE_DDL_AUTO=validate
```

## 🔧 Backend Deployment (Render)

### 1. Prepare Backend for Deployment
1. Ensure your Spring Boot app has a proper `main` method
2. Add a `system.properties` file in the backend root:

```properties
java.runtime.version=17
```

### 2. Deploy to Render
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `makhana-backend`
   - **Root Directory**: `pinaka-makhana-backend/makhana-store`
   - **Runtime**: `Java`
   - **Build Command**: `./mvnw clean install`
   - **Start Command**: `./mvnw spring-boot:run`

### 3. Set Environment Variables in Render
Add these environment variables in Render dashboard:
```
SERVER_PORT=10000
JWT_SECRET=your-strong-jwt-secret-here
DATABASE_URL=jdbc:mysql://aws.connect.psdb.cloud/pinaka-db?sslMode=VERIFY_IDENTITY
DATABASE_USERNAME=your-planetscale-username
DATABASE_PASSWORD=your-planetscale-password
HIBERNATE_DDL_AUTO=validate
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS=true
```

### 4. Deploy and Get Backend URL
- Render will provide a URL like: `https://makhana-backend.onrender.com`
- Your API will be available at: `https://makhana-backend.onrender.com/api`

## 🎨 Frontend Deployment (Vercel)

### 1. Prepare Frontend for Deployment
1. Ensure your React app builds successfully locally
2. Test with: `npm run build`

### 2. Deploy to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `pinaka-makhana-frontend/makhana-store-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. Set Environment Variables in Vercel
Add this environment variable in Vercel dashboard:
```
VITE_API_BASE_URL=https://makhana-backend.onrender.com/api
```

### 4. Deploy and Get Frontend URL
- Vercel will provide a URL like: `https://makhana-frontend.vercel.app`

## 🔄 Post-Deployment Steps

### 1. Test the Connection
1. Visit your frontend URL
2. Test user registration/login
3. Test product browsing
4. Test cart functionality

### 2. Update CORS (if needed)
If you encounter CORS issues, update your Spring Boot backend to allow your frontend domain:

```java
@CrossOrigin(origins = {"https://makhana-frontend.vercel.app", "http://localhost:5173"})
```

### 3. Set Up Custom Domain (Optional)
- **Vercel**: Add custom domain in project settings
- **Render**: Add custom domain in service settings

## 🛠️ Local Development

### Running Locally
1. **Backend**: 
   ```bash
   cd pinaka-makhana-backend/makhana-store
   ./mvnw spring-boot:run
   ```

2. **Frontend**:
   ```bash
   cd pinaka-makhana-frontend/makhana-store-frontend
   npm run dev
   ```

### Environment Variables for Local Development
- Frontend will use `http://localhost:8081/api` (default)
- Backend will use local MySQL database (default)

## 🔒 Security Notes

1. **JWT Secret**: Generate a strong secret for production
2. **Database**: Use strong passwords
3. **Email**: Use app-specific passwords for Gmail
4. **Environment Variables**: Never commit .env files to Git

## 📞 Troubleshooting

### Common Issues
1. **CORS Errors**: Check frontend URL is allowed in backend CORS config
2. **Database Connection**: Verify PlanetScale connection string
3. **Build Failures**: Check Java version compatibility
4. **Environment Variables**: Ensure all variables are set in deployment platforms

### Support
- **Vercel**: https://vercel.com/docs
- **Render**: https://render.com/docs
- **PlanetScale**: https://planetscale.com/docs