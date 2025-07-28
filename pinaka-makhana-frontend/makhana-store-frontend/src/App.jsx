import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import AdminRoute from './components/AdminRoute'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import Account from './pages/Account';
import Wishlist from './pages/Wishlist';
import Settings from './pages/Settings';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement';
import CouponManagement from './pages/admin/CouponManagement';

function App() {
  return (
    <div className="font-sans">
      <ScrollToTop />
      
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={
          <>
            <Navbar />
            <Home />
            <Footer />
          </>
        } />
        <Route path="/about" element={
          <>
            <Navbar />
            <About />
            <Footer />
          </>
        } />
        <Route path="/contact" element={
          <>
            <Navbar />
            <Contact />
            <Footer />
          </>
        } />
        <Route path="/products" element={
          <>
            <Navbar />
            <Products />
            <Footer />
          </>
        } />
        <Route path="/product/:id" element={
          <>
            <Navbar />
            <ProductDetail />
            <Footer />
          </>
        } />
        <Route path="/cart" element={
          <>
            <Navbar />
            <Cart />
            <Footer />
          </>
        } />
        <Route path="/checkout" element={
          <>
            <Navbar />
            <Checkout />
            <Footer />
          </>
        } />
        <Route path="/orders" element={
          <>
            <Navbar />
            <Orders />
            <Footer />
          </>
        } />
        <Route path="/login" element={
          <>
            <Navbar />
            <Login />
            <Footer />
          </>
        } />
        <Route path="/register" element={
          <>
            <Navbar />
            <Register />
            <Footer />
          </>
        } />
        <Route path="/profile" element={
          <>
            <Navbar />
            <Account />
            <Footer />
          </>
        } />
        <Route path="/wishlist" element={
          <>
            <Navbar />
            <Wishlist />
            <Footer />
          </>
        } />
        <Route path="/favorites" element={<Navigate to="/wishlist" replace />} />
        <Route path="/settings" element={
          <>
            <Navbar />
            <Settings />
            <Footer />
          </>
        } />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/products" element={
          <AdminRoute>
            <ProductManagement />
          </AdminRoute>
        } />
        <Route path="/admin/products/new" element={
          <AdminRoute>
            <ProductManagement />
          </AdminRoute>
        } />
        <Route path="/admin/orders" element={
          <AdminRoute>
            <OrderManagement />
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        } />
        <Route path="/admin/coupons" element={
          <AdminRoute>
            <CouponManagement />
          </AdminRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;