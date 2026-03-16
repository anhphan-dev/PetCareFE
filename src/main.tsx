import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import './index.css';
import AboutPage from './pages/AboutPage';
import DashBoard from './pages/AdminPage/DashBoard';
import BookingPage from './pages/BookingPage';
import CartPage from './pages/CartPage/CartPage';
import ContactPage from './pages/ContactPage';
import HomePage from './pages/homePage';
import ProductDetailPage from './pages/ProductsPage/ProductDetailPage';
import ProductsPage from './pages/ProductsPage/ProductsPage';
import AddProductPage from './pages/StaffPage/AddProductPage';
import StaffDashBoard from './pages/StaffPage/DashBoard';
import ProviderAppointmentsPage from './pages/ProviderPage/ProviderAppointmentsPage';
import ForgotPasswordPage from './pages/UserPage/ForgotPasswordPage';
import LoginPage from './pages/UserPage/LoginPage';
import NewsPage from './pages/UserPage/NewsPage';
import RegisterPage from './pages/UserPage/RegisterPage';
import ServicePage from './pages/UserPage/ServicePage';
import AIHealthPage from './pages/UserPage/AIHealthPage';
import SubscriptionPage from './pages/SubscriptionPage/SubscriptionPage';
import SubscriptionSuccessPage from './pages/SubscriptionPage/SubscriptionSuccessPage';
import SubscriptionCancelPage from './pages/SubscriptionPage/SubscriptionCancelPage';
import ProfilePage from './pages/UserPage/ProfilePage';
import PetsPage from './pages/UserPage/PetsPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';

// import DashBoard from './pages/AdminPage/DashBoard';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
    <BrowserRouter>
    <ScrollToTop/>
      <AuthProvider>
        <CartProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="gioi-thieu" element={<AboutPage />} />
            <Route path="dich-vu" element={<ServicePage />} />
            <Route path="tin-tuc" element={<NewsPage />} />
            <Route path="lien-he" element={<ContactPage />} />
            <Route path="dat-lich" element={<BookingPage />} />
            <Route path="dang-nhap" element={<LoginPage />} />
            <Route path="dang-ky" element={<RegisterPage />} />
            <Route path="quen-mat-khau" element={<ForgotPasswordPage />} />

            {/*SHOP ROUTE*/}
            <Route path="cua-hang" element={<ProductsPage/>} />
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

          <Route path="/staff" element={<StaffDashBoard />} />
          <Route path="/staff/them-san-pham" element={<AddProductPage />} />


          {/*PROVIDER ROUTE*/}
          <Route path="/provider/lich-dat" element={<ProviderAppointmentsPage />} />

          {/* <Route path="/provider" element={<DashBoard />} /> */}
        </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
    </GoogleOAuthProvider>
    <ToastContainer />
  </StrictMode>
);
