import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Layout from './components/Layout';
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
import ForgotPasswordPage from './pages/UserPage/ForgotPasswordPage';
import LoginPage from './pages/UserPage/LoginPage';
import NewsPage from './pages/UserPage/NewsPage';
import RegisterPage from './pages/UserPage/RegisterPage';
import ServicePage from './pages/UserPage/ServicePage';

// import DashBoard from './pages/AdminPage/DashBoard';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
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
        {/* <Route path="/thanh-toan" element={<YourCheckoutSandboxPage />} /> */}

          </Route>
          <Route path="/admin" element={<DashBoard />} />

          <Route path="/staff" element={<StaffDashBoard />} />
          <Route path="/staff/them-san-pham" element={<AddProductPage />} />


          {/*PROVIDER ROUTE*/}
          {/* <Route path="/provider" element={<ProviderDashBoard />} /> */}

          {/* <Route path="/provider" element={<DashBoard />} /> */}
        </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
    <ToastContainer />
  </StrictMode>
);
