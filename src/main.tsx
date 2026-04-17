import { GoogleOAuthProvider } from '@react-oauth/google';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import './index.css';
import AboutPage from './pages/AboutPage';
import AdminBlogPage from './pages/AdminPage/AdminBlogPage';
import AdminPlaceholderPage from './pages/AdminPage/AdminPlaceholderPage';
import DashBoard from './pages/AdminPage/DashBoard';
import ProductsPageAdmin from './pages/AdminPage/ProductsPage';
import UsersPage from './pages/AdminPage/UsersPage';
import VouchersPage from './pages/AdminPage/VouchersPage';
import BookingPage from './pages/BookingPage/BookingPage';
import MyAppointmentsPage from './pages/BookingPage/MyAppointmentPage';
import CartPage from './pages/CartPage/CartPage';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutPage/CheckoutSuccessPage';
import ContactPage from './pages/ContactPage';
import DoctorAppointmentsPage from './pages/DoctorPage/DoctorAppointmentPage';
import HomePage from './pages/homePage';
import ProductDetailPage from './pages/ProductsPage/ProductDetailPage';
import ProductsPage from './pages/ProductsPage/ProductsPage';
import AddProductPage from './pages/StaffPage/AddProductPage';
import StaffDashBoard from './pages/StaffPage/DashBoard';
import ProductManagePage from './pages/StaffPage/ProductManagePage';
import SubscriptionCancelPage from './pages/SubscriptionPage/SubscriptionCancelPage';
import SubscriptionPage from './pages/SubscriptionPage/SubscriptionPage';
import SubscriptionSuccessPage from './pages/SubscriptionPage/SubscriptionSuccessPage';
import AIHealthPage from './pages/UserPage/AIHealthPage';
import ForgotPasswordPage from './pages/UserPage/ForgotPasswordPage';
import LoginPage from './pages/UserPage/LoginPage';
import NewsDetailPage from './pages/UserPage/NewsDetailPage';
import NewsPage from './pages/UserPage/NewsPage';
import PetsPage from './pages/UserPage/PetsPage';
import ProfilePage from './pages/UserPage/ProfilePage';
import RegisterPage from './pages/UserPage/RegisterPage';
import ServicePage from './pages/UserPage/ServicePage';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="gioi-thieu" element={<AboutPage />} />
                <Route path="dich-vu" element={<ServicePage />} />
                <Route path="tin-tuc" element={<NewsPage />} />
                <Route path="tin-tuc/:slug" element={<NewsDetailPage />} />
                <Route path="lien-he" element={<ContactPage />} />
                
                <Route path="dang-nhap" element={<LoginPage />} />
                <Route path="dang-ky" element={<RegisterPage />} />
                <Route path="quen-mat-khau" element={<ForgotPasswordPage />} />

                {/*Booking ROUTE*/}
                <Route path="dat-lich" element={<BookingPage />} />
                <Route path="lich-hen" element={<MyAppointmentsPage />} />
                

                {/*SHOP ROUTE*/}
                <Route path="cua-hang" element={<ProductsPage />} />
                <Route path="/san-pham/:id" element={<ProductDetailPage />} />
                <Route path="/gio-hang" element={<CartPage />} />
                <Route path="thanh-toan" element={<CheckoutPage />} />
                <Route path="thanh-toan/thanh-cong" element={<CheckoutSuccessPage />} />

                {/*USER ROUTES*/}
                <Route path="tai-khoan" element={<ProfilePage />} />
                <Route path="thu-cung" element={<PetsPage />} />
                <Route path="ai-suc-khoe" element={<AIHealthPage />} />

                {/*SUBSCRIPTION ROUTES*/}
                <Route path="membership" element={<SubscriptionPage />} />
                <Route path="subscription/success" element={<SubscriptionSuccessPage />} />
                <Route path="subscription/cancel" element={<SubscriptionCancelPage />} />

              </Route>
              <Route path="/admin" element={<DashBoard />} />
              <Route path="/admin/khach-hang" element={<UsersPage />} />
              <Route path="/admin/san-pham" element={<ProductsPageAdmin />} />
              <Route path="/admin/tin-tuc" element={<AdminBlogPage />} />
              <Route path="/admin/vouchers" element={<VouchersPage />} />
              <Route
                path="/admin/lich-hen"
                element={
                  <AdminPlaceholderPage
                    title="Lịch hẹn"
                    description="Module quản trị lịch hẹn dịch vụ đang được hoàn thiện. Bạn có thể theo dõi lịch từ trang dành cho bác sĩ hoặc cập nhật sau khi backend bổ sung API."
                  />
                }
              />
              <Route
                path="/admin/cai-dat"
                element={
                  <AdminPlaceholderPage
                    title="Cài đặt"
                    description="Khu vực cấu hình hệ thống sẽ được bổ sung trong phiên bản sau."
                  />
                }
              />

              <Route path="/staff" element={<StaffDashBoard />} />
              <Route path="/staff/them-san-pham" element={<AddProductPage />} />
              <Route path="/staff/sua-san-pham/:id" element={<AddProductPage />} />
              <Route path="/staff/quan-li-san-pham" element={<ProductManagePage />} />



              <Route path="/doctor" element={<DoctorAppointmentsPage />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
    <ToastContainer />
  </StrictMode>
);
