# 🚀 Pinaka Makhana Application - Deployment Checklist

## ✅ Pre-Deployment Checklist

### Repository Setup
- [x] Code is pushed to GitHub repository
- [x] All deployment configuration files created
- [x] Environment variable templates created
- [x] Health check endpoint added
- [x] CORS configuration updated for production

### Files Created/Updated
- [x] `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- [x] `pinaka-makhana-backend/makhana-store/render.yaml` - Render configuration
- [x] `pinaka-makhana-frontend/makhana-store-frontend/vercel.json` - Vercel configuration
- [x] `pinaka-makhana-backend/makhana-store/src/main/java/com/pinaka/makhana/controller/HealthController.java` - Health endpoint
- [x] `pinaka-makhana-backend/makhana-store/.env.example` - Backend environment template
- [x] `pinaka-makhana-frontend/makhana-store-frontend/.env.example` - Frontend environment template
- [x] `deploy.sh` / `deploy.bat` - Deployment scripts

---

## 🗄️ Database Setup (PlanetScale)

### Steps to Complete:
1. [ ] Create PlanetScale account at https://planetscale.com/
2. [ ] Create database named `pinaka-db`
3. [ ] Generate connection credentials
4. [ ] Note down connection details:
   - [ ] Host: `aws.connect.psdb.cloud`
   - [ ] Username: `_____________`
   - [ ] Password: `_____________`
   - [ ] Database: `pinaka-db`

---

## ⚙️ Backend Deployment (Render)

### Steps to Complete:
1. [ ] Create Render account at https://dashboard.render.com/
2. [ ] Click "New" → "Web Service"
3. [ ] Connect GitHub repository
4. [ ] Configure service:
   - [ ] Name: `pinaka-makhana-backend`
   - [ ] Root Directory: `pinaka-makhana-backend/makhana-store`
   - [ ] Build Command: `mvn clean package -DskipTests`
   - [ ] Start Command: `java -jar target/makhana-store-0.0.1-SNAPSHOT.jar`
   - [ ] Plan: Free

### Environment Variables to Add:
- [ ] `DATABASE_URL` = `jdbc:mysql://aws.connect.psdb.cloud/pinaka-db?sslMode=VERIFY_IDENTITY`
- [ ] `DATABASE_USERNAME` = `[your-planetscale-username]`
- [ ] `DATABASE_PASSWORD` = `[your-planetscale-password]`
- [ ] `JWT_SECRET` = `[generate-strong-256-bit-secret]`
- [ ] `SERVER_PORT` = `10000`
- [ ] `HIBERNATE_DDL_AUTO` = `update`
- [ ] `APP_UPLOAD_DIR` = `/tmp/uploads/images/`

### Deployment Status:
- [ ] Service deployed successfully
- [ ] Health check passing at `/api/health`
- [ ] Backend URL: `https://________________.onrender.com`

---

## 🎨 Frontend Deployment (Vercel)

### Steps to Complete:
1. [ ] Create Vercel account at https://vercel.com/dashboard
2. [ ] Click "New Project"
3. [ ] Import GitHub repository
4. [ ] Configure project:
   - [ ] Framework Preset: Vite
   - [ ] Root Directory: `pinaka-makhana-frontend/makhana-store-frontend`
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `dist`

### Environment Variables to Add:
- [ ] `VITE_API_BASE_URL` = `https://[your-backend-app].onrender.com/api`

### Deployment Status:
- [ ] Project deployed successfully
- [ ] Frontend URL: `https://________________.vercel.app`

---

## 🧪 Testing Checklist

### Backend Testing:
- [ ] Health endpoint responds: `GET https://[backend-url]/api/health`
- [ ] API root responds: `GET https://[backend-url]/api/`
- [ ] Products endpoint responds: `GET https://[backend-url]/api/products`
- [ ] CORS headers present for frontend domain

### Frontend Testing:
- [ ] Application loads successfully
- [ ] Products display correctly
- [ ] User registration works
- [ ] User login works
- [ ] Shopping cart functionality works
- [ ] Admin panel accessible (with admin credentials)
- [ ] Image uploads work
- [ ] Responsive design on mobile devices

### Integration Testing:
- [ ] Frontend successfully connects to backend
- [ ] Database operations work (create, read, update, delete)
- [ ] Authentication flow works end-to-end
- [ ] File uploads save correctly
- [ ] Error handling works properly

---

## 🎯 Final URLs

### Production URLs:
- **Frontend**: `https://________________.vercel.app`
- **Backend**: `https://________________.onrender.com`
- **API Base**: `https://________________.onrender.com/api`

### Admin Credentials:
- **Email**: `anupamakashyap@pinaka.com`
- **Password**: `Admin@123`

---

## 🎉 Post-Deployment

### Share with Friends:
- [ ] Test the application thoroughly
- [ ] Share frontend URL with friends
- [ ] Monitor application performance
- [ ] Check for any issues or feedback

### Optional Enhancements:
- [ ] Add custom domain name
- [ ] Set up monitoring and analytics
- [ ] Configure automated backups
- [ ] Upgrade to paid tiers if needed

---

## 🚨 Troubleshooting

### Common Issues:
1. **Backend takes long to load**: Normal for free tier (30-60 seconds)
2. **CORS errors**: Check CORS configuration in SecurityConfig.java
3. **Database connection issues**: Verify PlanetScale credentials
4. **Build failures**: Check logs in Render/Vercel dashboards

### Support Resources:
- Render Documentation: https://render.com/docs
- Vercel Documentation: https://vercel.com/docs
- PlanetScale Documentation: https://planetscale.com/docs

---

**HAR HAR MAHADEV! 🙏**

Your Pinaka Makhana application is ready for the world! 🌍
