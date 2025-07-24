# Pinaka Makhana Frontend

A premium e-commerce frontend application for Pinaka Makhana built with React, Vite, and Tailwind CSS.

## 🌟 Features Completed

### ✅ Authentication System
- **JWT Integration**: Full authentication with Spring Boot backend
- **Login/Register Pages**: Beautiful forms with validation
- **Protected Routes**: Cart and Orders only accessible when logged in
- **Persistent Sessions**: Token-based authentication with localStorage

### ✅ Product Management
- **API Integration**: Fetches products from Spring Boot backend
- **Fallback Support**: Shows demo products if backend unavailable
- **Modern UI**: Professional product cards with hover effects
- **Responsive Design**: Works on all screen sizes

### ✅ Shopping Cart
- **Local & API Integration**: Works with both local state and backend
- **Add to Cart**: Seamless product addition
- **Cart Management**: Remove items, view totals
- **Professional UI**: Modern cart layout with product images

### ✅ Order Management
- **Place Orders**: Full checkout integration with backend
- **Order History**: View past orders with details
- **Order Status**: Visual status indicators
- **Order Details**: Complete item breakdown with images

### ✅ Professional UI/UX
- **Modern Design**: Premium D2C brand aesthetic
- **Responsive Layout**: Mobile-first design
- **Professional Navbar**: Dynamic authentication states
- **Hero Section**: Attractive landing page
- **Loading States**: Proper loading indicators
- **Error Handling**: Graceful error messages

## 🏗️ Project Structure

```
makhana-store-frontend/
├── src/
│   ├── components/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Authentication state management
│   │   │   └── CartContext.jsx     # Cart state management
│   │   └── Navbar.jsx              # Professional navigation
│   ├── pages/
│   │   ├── Home.jsx               # Landing page with hero section
│   │   ├── Products.jsx           # Product listing with API integration
│   │   ├── Cart.jsx               # Shopping cart with checkout
│   │   ├── Orders.jsx             # Order history page
│   │   ├── Login.jsx              # Login form
│   │   └── Register.jsx           # Registration form
│   ├── services/
│   │   └── api.js                 # API service layer for backend integration
│   ├── App.jsx                    # Main app component with routing
│   └── main.jsx                   # App entry point with providers
```

## 🔧 Backend Integration

The frontend integrates with these Spring Boot APIs:

- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Products**: `/api/products`
- **Cart**: `/api/cart/add`, `/api/cart/remove`
- **Orders**: `/api/orders/place`, `/api/orders/history`

## 🎨 Design Features

- **Color Scheme**: Professional red (#DC2626) and gray palette
- **Typography**: Clean, readable fonts with proper hierarchy
- **Shadows & Effects**: Modern shadow system and hover transitions
- **Icons**: Custom SVG icons for enhanced visual appeal
- **Images**: High-quality Unsplash images for product showcase

## 🚀 Running the Application

1. **Start the backend** (Spring Boot on port 8080)
2. **Start the frontend**:
   ```bash
   cd makhana-store-frontend
   npm run dev
   ```
3. **Open**: http://localhost:5173

## 📱 User Flow

1. **Browse Products**: View all makhana varieties on the home page or products page
2. **Register/Login**: Create account or sign in to existing account
3. **Add to Cart**: Select products and add them to cart
4. **Checkout**: Review cart and place order
5. **Order History**: View all past orders with details

## 🔐 Authentication Flow

1. User registers/logs in → receives JWT token
2. Token stored in localStorage
3. All API requests include Authorization header
4. Protected routes redirect to login if not authenticated
5. Navbar shows user info and logout option when authenticated

## 💡 Technical Highlights

- **React Hooks**: Modern functional components with hooks
- **Context API**: State management for auth and cart
- **API Integration**: Clean service layer for backend communication
- **Error Handling**: Graceful error states and fallbacks
- **Loading States**: Professional loading indicators
- **Responsive Design**: Mobile-first CSS with Tailwind

This frontend provides a complete, production-ready e-commerce experience that integrates seamlessly with the Spring Boot backend!
