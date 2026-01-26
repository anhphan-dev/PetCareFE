import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/homePage';
import AboutPage from './pages/AboutPage';
import ServicePage from './pages/UserPage/ServicePage';
import NewsPage from './pages/UserPage/NewsPage';
import ContactPage from './pages/ContactPage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/UserPage/LoginPage';
import RegisterPage from './pages/UserPage/RegisterPage';
import ForgotPasswordPage from './pages/UserPage/ForgotPasswordPage';
// import DashBoard from './pages/AdminPage/DashBoard';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
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
          </Route>
          {/* <Route path="/admin" element={<DashBoard />} /> */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
