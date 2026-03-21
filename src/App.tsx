
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Index from './pages/Index';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Search from './pages/Search';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Orders from './pages/Orders';
import OrderConfirmation from './pages/OrderConfirmation';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ShippingPolicy from './pages/ShippingPolicy';
import ReturnPolicy from './pages/ReturnPolicy';
import Testimonials from './pages/Testimonials';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminCarousel from './pages/admin/Carousel';
import AdminTestimonials from './pages/admin/Testimonials';
import AdminUsers from './pages/admin/Users';
import AdminDelivery from './pages/admin/Delivery';
import AdminChats from './pages/admin/Chats';
import ChatWidget from './components/chat/ChatWidget';
import WhatsAppButton from './components/chat/WhatsAppButton';
import { useAuth } from './hooks/useAuth';
import { Toaster } from './components/ui/toaster';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import StripeProvider from './components/stripe/StripeProvider';
import "./App.css";

// ScrollToTop component to ensure page scrolls to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// ConditionalFooter component to only show footer on non-admin pages
function ConditionalFooter() {
  const { pathname } = useLocation();
  const isAdminPage = pathname.startsWith('/admin');
  
  if (isAdminPage) {
    return null;
  }
  
  return <Footer />;
}

// ConditionalNavbar component to only show navbar on non-admin pages
function ConditionalNavbar() {
  const { pathname } = useLocation();
  const isAdminPage = pathname.startsWith('/admin');
  
  if (isAdminPage) {
    return null;
  }
  
  return <Navbar />;
}

// ConditionalChatWidgets component to only show chat widgets on non-admin pages
function ConditionalChatWidgets() {
  const { pathname } = useLocation();
  const isAdminPage = pathname.startsWith('/admin');
  
  if (isAdminPage) {
    return null;
  }
  
  return (
    <>
      <ChatWidget key="chat-widget-component" />
      <WhatsAppButton key="whatsapp-button-component" />
    </>
  );
}

function App() {
  const { isAdmin } = useAuth();
  
  return (
    <Router>
      <StripeProvider>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <ConditionalNavbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/search" element={<Search />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="/login" element={<Login />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/return-policy" element={<ReturnPolicy />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Login />} />
              <Route path="/admin/products" element={isAdmin ? <AdminProducts /> : <Login />} />
              <Route path="/admin/categories" element={isAdmin ? <AdminCategories /> : <Login />} />
              <Route path="/admin/carousel" element={isAdmin ? <AdminCarousel /> : <Login />} />
              <Route path="/admin/testimonials" element={isAdmin ? <AdminTestimonials /> : <Login />} />
              <Route path="/admin/users" element={isAdmin ? <AdminUsers /> : <Login />} />
              <Route path="/admin/delivery" element={isAdmin ? <AdminDelivery /> : <Login />} />
              <Route path="/admin/chats" element={isAdmin ? <AdminChats /> : <Login />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <ConditionalFooter />
          <ConditionalChatWidgets />
          <Toaster />
        </div>
      </StripeProvider>
    </Router>
  );
}

export default App;
