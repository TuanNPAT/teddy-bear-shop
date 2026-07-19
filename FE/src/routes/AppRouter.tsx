import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import HomePage from '../pages/HomePage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProfilePage from '../pages/ProfilePage';
import CheckoutPage from '../pages/CheckoutPage';
import ThankYouPage from '../pages/ThankYouPage';
import OrderHistoryPage from '../pages/OrderHistoryPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';

// Admin CMS Layout, Guard, and Pages
import AdminLayout from '../components/layout/AdminLayout';
import AdminGuard from '../components/admin/AdminGuard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminStaff from '../pages/admin/AdminStaff';
import AdminUsers from '../pages/admin/AdminUsers';

import CustomerGuard from '../components/CustomerGuard';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer / Client side routes */}
        <Route
          path="/"
          element={
            <CustomerGuard>
              <MainLayout />
            </CustomerGuard>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="thank-you" element={<ThankYouPage />} />
          <Route path="orders" element={<OrderHistoryPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>

        {/* Admin CMS routes */}
        <Route
          path="/admin"
          element={
            <AdminGuard allowedRoles={['ADMIN', 'STAFF']}>
              <AdminLayout />
            </AdminGuard>
          }
        >
          {/* Admin only views */}
          <Route
            index
            element={
              <AdminGuard allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </AdminGuard>
            }
          />
          <Route
            path="products"
            element={
              <AdminGuard allowedRoles={['ADMIN']}>
                <AdminProducts />
              </AdminGuard>
            }
          />
          <Route
            path="categories"
            element={
              <AdminGuard allowedRoles={['ADMIN']}>
                <AdminCategories />
              </AdminGuard>
            }
          />
          <Route
            path="staff"
            element={
              <AdminGuard allowedRoles={['ADMIN']}>
                <AdminStaff />
              </AdminGuard>
            }
          />
          <Route
            path="users"
            element={
              <AdminGuard allowedRoles={['ADMIN']}>
                <AdminUsers />
              </AdminGuard>
            }
          />

          {/* Admin & Staff shared views */}
          <Route
            path="orders"
            element={
              <AdminGuard allowedRoles={['ADMIN', 'STAFF']}>
                <AdminOrders />
              </AdminGuard>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
