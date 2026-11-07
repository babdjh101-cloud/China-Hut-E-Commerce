import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProductFeatures } from './components/ProductFeatures';
import { ProductGallery } from './components/ProductGallery';
import { UsageGuide } from './components/UsageGuide';
import { OrderForm } from './components/OrderForm';
import { ProductVideoSection } from './components/ProductVideoSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { StickyMobileOrderBar } from './components/StickyMobileOrderBar';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { ImageLightbox } from './components/ImageLightbox';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { AdminPortal } from './components/admin/AdminPortal';
import { INITIAL_PRODUCT } from './config/constants';
import { Order } from './types';
import { fetchActivePrimaryProduct } from './services/productService';

export default function App() {
  const [quantity, setQuantity] = useState(1);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const checkIsAdminPath = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    return (
      path === '/admin' ||
      path.startsWith('/admin/') ||
      window.location.search.includes('admin=true') ||
      window.location.hash === '#admin'
    );
  };

  const [isAdminOpen, setIsAdminOpen] = useState(checkIsAdminPath);
  const [activeProduct, setActiveProduct] = useState({
    price: INITIAL_PRODUCT.price,
    deliveryCharge: INITIAL_PRODUCT.baseDeliveryCharge,
  });

  const loadProduct = async () => {
    try {
      const prod = await fetchActivePrimaryProduct();
      if (prod) {
        setActiveProduct({
          price: prod.price,
          deliveryCharge: prod.deliveryCharge,
        });
      }
    } catch (e) {
      console.warn('Could not load active product:', e);
    }
  };

  useEffect(() => {
    loadProduct();
    const handlePopState = () => {
      setIsAdminOpen(checkIsAdminPath());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenAdmin = () => {
    setIsAdminOpen(true);
    if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
      window.history.pushState({ page: 'admin' }, '', '/admin');
    }
  };

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    loadProduct();
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      window.history.pushState({ page: 'home' }, '', '/');
    }
  };

  const scrollToOrderForm = (targetQty?: number | unknown) => {
    if (typeof targetQty === 'number' && Number.isFinite(targetQty) && targetQty > 0) {
      setQuantity(targetQty);
    } else {
      setQuantity((prev) => (typeof prev === 'number' && prev > 0 ? prev : 1));
    }

    const card = document.getElementById('order-checkout-card') || document.getElementById('order-form');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      card.classList.add('ring-4', 'ring-[#65051F]/40');
      setTimeout(() => {
        card.classList.remove('ring-4', 'ring-[#65051F]/40');
      }, 1500);

      setTimeout(() => {
        const input = document.getElementById('customer-name') as HTMLInputElement | null;
        if (input) {
          input.focus({ preventScroll: true });
        }
      }, 450);
    }
  };

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
  };

  return (
    <div className="min-h-screen bg-[#FFF8ED] text-[#20040B] flex flex-col font-sans selection:bg-[#D6A638]/40 selection:text-[#65051F] relative">
      {/* 1. Header with Logo, Navigation Links, Contact, and Order Now CTA */}
      <Header onOrderClick={scrollToOrderForm} />

      <main className="flex-1">
        {/* 1. Hero Section: Showcase, Package Selector, Quick CTA */}
        <HeroSection
          quantity={quantity}
          onQuantityChange={setQuantity}
          onOrderClick={scrollToOrderForm}
          onImageClick={(url) => setLightboxImage(url)}
        />

        {/* 2. Key Product Features: 4 essential concise benefits */}
        <ProductFeatures />

        {/* 3. ORDER FORM: Centered in the middle of the landing page */}
        <OrderForm
          quantity={quantity}
          onQuantityChange={setQuantity}
          productPrice={activeProduct.price}
          deliveryCharge={activeProduct.deliveryCharge}
          onOrderSuccess={handleOrderSuccess}
        />

        {/* 4. Product Video Section: 16:9 responsive showcase */}
        <ProductVideoSection onOrderClick={scrollToOrderForm} />

        {/* 5. Product Gallery: Authentic photographs & Lightbox zoom */}
        <ProductGallery
          onImageZoom={(url) => setLightboxImage(url)}
          onOrderClick={scrollToOrderForm}
        />

        {/* 6. Usage Information: 3 simple steps */}
        <UsageGuide />

        {/* 8. FAQ Section: 4 crisp questions & answers */}
        <FaqSection />
      </main>

      {/* 11. Footer: China Hut branding, business address, email, map, policies */}
      <Footer onAdminClick={handleOpenAdmin} />

      {/* 12. Sticky Mobile Order Button with Dynamic Price and WhatsApp Action */}
      <StickyMobileOrderBar
        quantity={quantity}
        productPrice={activeProduct.price}
        baseDeliveryCharge={activeProduct.deliveryCharge}
        onOrderClick={scrollToOrderForm}
      />

      {/* 13. Persistent Floating WhatsApp Order Button for Mobile & Desktop */}
      <FloatingWhatsAppButton quantity={quantity} />

      {/* Lightbox Zoom Modal */}
      <ImageLightbox
        isOpen={Boolean(lightboxImage)}
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />

      {/* Order Confirmation Receipt Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
      />

      {/* 14. Admin Management Portal */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
      />
    </div>
  );
}
