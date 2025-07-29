# 🚀 Pinaka Makhana Application - Free Deployment Guide

This guide will help you deploy your Pinaka Makhana application for free using:
- **Frontend**: Vercel (Free tier)
- **Backend**: Render (Free tier)
- **Database**: Aiven MySQL (Free tier - 1GB storage)

## 📋 Prerequisites

1. GitHub account with your repository
2. Vercel account (free)
3. Render account (free)
4. Aiven account (free)

---

## 🗄️ STEP 1: Setup Free Database (Aiven MySQL)

### 1.1 Create Aiven Account
1. Go to [Aiven](https://aiven.io/)
2. Sign up with GitHub or email (free tier: 1GB storage, MySQL 8.0)
3. Click "Create Service" → "MySQL"
4. Select "Free Plan" and choose a cloud region
5. Name your service `pinaka-db`

### 1.2 Get Database Connection Details
1. In Aiven console, go to your MySQL service
2. Wait for service to start (2-3 minutes)
3. Go to "Overview" tab and copy connection details:
   ```
   Host: [service-name]-[project].aivencloud.com
   Port: [port-number]
   Username: avnadmin
   Password: [generated-password]
   Database: defaultdb
   ```

### 1.3 Database URL Format
Your DATABASE_URL will be:
```
jdbc:mysql://[service-name]-[project].aivencloud.com:[port]/defaultdb?sslMode=REQUIRE
```

---

## ⚙️ STEP 2: Prepare Backend for Render

### 2.1 Environment Variables for Render
You'll need these environment variables in Render:

```bash
# Database Configuration
DATABASE_URL=jdbc:mysql://[service-name]-[project].aivencloud.com:[port]/defaultdb?sslMode=REQUIRE
DATABASE_USERNAME=avnadmin
DATABASE_PASSWORD=your-aiven-password

# Server Configuration
SERVER_PORT=10000
HIBERNATE_DDL_AUTO=update

# Security
JWT_SECRET=your-strong-jwt-secret-here-256-bits-minimum

# File Upload (Render has ephemeral storage)
APP_UPLOAD_DIR=/tmp/uploads/images/
```

### 2.2 Create Render Configuration
Create `render.yaml` in your backend root directory.

---

## 🎨 STEP 3: Prepare Frontend for Vercel

### 3.1 Environment Variables for Vercel
```bash
VITE_API_BASE_URL=https://your-backend-app.onrender.com/api
```

### 3.2 Create Vercel Configuration
Create `vercel.json` in your frontend root directory.

---

## 🌐 STEP 4: Deploy Applications

### 4.1 Deploy Backend to Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `pinaka-makhana-backend`
   - **Root Directory**: `pinaka-makhana-backend/makhana-store`
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/makhana-store-0.0.1-SNAPSHOT.jar`
   - **Environment**: Add all environment variables from Step 2.1

### 4.2 Deploy Frontend to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `pinaka-makhana-frontend/makhana-store-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: Add VITE_API_BASE_URL

---

## 🔧 STEP 5: Configuration Files

The following configuration files will be created automatically:
- `render.yaml` - Backend deployment configuration
- `vercel.json` - Frontend deployment configuration
- Updated environment configurations

---

## 🎯 Expected Results

After successful deployment:
- **Frontend URL**: `https://your-app.vercel.app`
- **Backend URL**: `https://your-backend-app.onrender.com`
- **Database**: PlanetScale MySQL-compatible database

Your friends will be able to access your Pinaka Makhana application and experience:
- ✅ Product browsing and search
- ✅ Shopping cart functionality
- ✅ User authentication
- ✅ Admin panel (for you)
- ✅ Image uploads and optimization
- ✅ Responsive design on all devices

---

## 🚨 Important Notes

1. **Free Tier Limitations**:
   - Render: Apps sleep after 15 minutes of inactivity
   - PlanetScale: 1GB storage limit
   - Vercel: 100GB bandwidth/month

2. **First Load**: Backend may take 30-60 seconds to wake up from sleep

3. **File Uploads**: On Render, uploaded files are stored in ephemeral storage and may be lost on restart

---

## 🎉 Next Steps

Once deployed, you can:
1. Share the Vercel URL with friends
2. Monitor usage in dashboards
3. Upgrade to paid tiers if needed
4. Add custom domain names

HAR HAR MAHADEV! Your Pinaka Makhana application will be live and accessible worldwide! 🌍
