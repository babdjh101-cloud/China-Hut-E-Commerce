import React, { useState, useEffect, useRef } from 'react';
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
import { PolicyModal } from './components/PolicyModal';
import { AdminPortal } from './components/admin/AdminPortal';
import { INITIAL_PRODUCT } from './config/constants';
import { Order } from './types';
import { fetchActivePrimaryProduct } from './services/productService';
import { initGTM, trackPageView, trackViewItem, trackBeginCheckout } from './lib/gtm';

export default function App() {
  const [quantity, setQuantity] = useState(1);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [activePolicy, setActivePolicy] = useState<'privacy' | 'terms' | 'delivery' | null>(null);
  const [isAtCheckout, setIsAtCheckout] = useState(false);

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
    id: INITIAL_PRODUCT.id,
    name: INITIAL_PRODUCT.name,
    price: INITIAL_PRODUCT.price,
    deliveryCharge: INITIAL_PRODUCT.baseDeliveryCharge,
  });

  // Track latest UI state in ref so popstate can read current values synchronously
  const stateRef = useRef({
    isAdminOpen,
    lightboxImage,
    confirmedOrder,
    activePolicy,
    isAtCheckout,
  });

  useEffect(() => {
    stateRef.current = {
      isAdminOpen,
      lightboxImage,
      confirmedOrder,
      activePolicy,
      isAtCheckout,
    };
  }, [isAdminOpen, lightboxImage, confirmedOrder, activePolicy, isAtCheckout]);

  const loadProduct = async () => {
    try {
      const prod = await fetchActivePrimaryProduct();
      if (prod) {
        setActiveProduct({
          id: prod.id,
          name: prod.name,
          price: prod.price,
          deliveryCharge: prod.deliveryCharge,
        });
        trackViewItem({ id: prod.id, name: prod.name, price: prod.price });
      } else {
        trackViewItem({ id: INITIAL_PRODUCT.id, name: INITIAL_PRODUCT.name, price: INITIAL_PRODUCT.price });
      }
    } catch (e) {
      console.warn('Could not load active product:', e);
      trackViewItem({ id: INITIAL_PRODUCT.id, name: INITIAL_PRODUCT.name, price: INITIAL_PRODUCT.price });
    }
  };

  useEffect(() => {
    // 1. Initialize GTM and record initial Page View
    initGTM('GTM-53BB4H6D');
    trackPageView(window.location.pathname, document.title);
    loadProduct();

    // 2. Establish a history buffer so mobile back button stays inside the landing page
    if (typeof window !== 'undefined') {
      if (!window.history.state || window.history.state.step === undefined) {
        window.history.replaceState({ page: 'home_base', step: 0 }, '', window.location.pathname);
        window.history.pushState({ page: 'home', step: 1 }, '', window.location.pathname);
      }
    }

    // 3. Step-by-Step Back Navigation Handler (Hardware Back / Browser Back)
    const handlePopState = () => {
      const current = stateRef.current;

      // Priority 1: Admin Portal Open
      if (current.isAdminOpen) {
        setIsAdminOpen(false);
        if (window.location.pathname.startsWith('/admin')) {
          window.history.replaceState({ page: 'home', step: 1 }, '', '/');
        }
        trackPageView('/', 'China Hut - SouthMoon Lipoma Removal Spray');
        return;
      }

      // Priority 2: Image Lightbox Open
      if (current.lightboxImage) {
        setLightboxImage(null);
        return;
      }

      // Priority 3: Order Confirmation Modal Open
      if (current.confirmedOrder) {
        setConfirmedOrder(null);
        return;
      }

      // Priority 4: Policy Modal Open
      if (current.activePolicy) {
        setActivePolicy(null);
        return;
      }

      // Priority 5: User scrolled to Checkout Form / Package Selected
      if (current.isAtCheckout) {
        setIsAtCheckout(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Base: If user hits back while at home top, keep them safely on the website
      window.history.pushState({ page: 'home', step: 1 }, '', window.location.pathname);
    };

    // 4. Backspace Key Trap on Desktop (Prevents navigating away when not typing)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        const activeEl = document.activeElement as HTMLElement | null;
        const isInput =
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.isContentEditable);

        if (!isInput) {
          e.preventDefault();
          const current = stateRef.current;
          if (current.isAdminOpen) {
            handleCloseAdmin();
          } else if (current.lightboxImage) {
            closeLightbox();
          } else if (current.confirmedOrder) {
            closeConfirmedOrder();
          } else if (current.activePolicy) {
            closePolicy();
          } else if (current.isAtCheckout) {
            setIsAtCheckout(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Step-by-Step UI Actions
  const openLightbox = (url: string) => {
    setLightboxImage(url);
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'lightbox' }, '');
    }
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const openPolicy = (type: 'privacy' | 'terms' | 'delivery') => {
    setActivePolicy(type);
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'policy', policyType: type }, '');
    }
  };

  const closePolicy = () => {
    setActivePolicy(null);
  };

  const openConfirmedOrder = (order: Order) => {
    setConfirmedOrder(order);
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'order_confirmed' }, '');
    }
  };

  const closeConfirmedOrder = () => {
    setConfirmedOrder(null);
  };

  const handleOpenAdmin = () => {
    setIsAdminOpen(true);
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
      window.history.pushState({ modal: 'admin', page: 'admin' }, '', '/admin');
    }
  };

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    loadProduct();
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      window.history.pushState({ page: 'home', step: 1 }, '', '/');
    }
  };

  const scrollToOrderForm = (targetQty?: number | unknown) => {
    const checkoutQty =
      typeof targetQty === 'number' && Number.isFinite(targetQty) && targetQty > 0
        ? targetQty
        : quantity;

    if (typeof targetQty === 'number' && Number.isFinite(targetQty) && targetQty > 0) {
      setQuantity(targetQty);
    } else {
      setQuantity((prev) => (typeof prev === 'number' && prev > 0 ? prev : 1));
    }

    // Step-by-step history push for order checkout section
    if (typeof window !== 'undefined' && !isAtCheckout) {
      setIsAtCheckout(true);
      window.history.pushState({ section: 'order-form' }, '');
    }

    // Fire GTM begin_checkout event
    trackBeginCheckout(
      { id: activeProduct.id, name: activeProduct.name, price: activeProduct.price },
      checkoutQty,
      checkoutQty === 2 ? 1580 : 830
    );

    const card =
      document.getElementById('order-checkout-card') || document.getElementById('order-form');
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

  return (
    <div className="min-h-screen bg-[#FFF8ED] text-[#20040B] flex flex-col font-sans selection:bg-[#D6A638]/40 selection:text-[#65051F] relative">
      {/* 1. Header with Logo, Navigation Links, Contact, and Order Now CTA */}
      <Header onOrderClick={scrollToOrderForm} />

      <main className="flex-1">
        {/* 1. Hero Section: Showcase, Package Selector, Quick CTA */}
        <HeroSection
          quantity={quantity}
          onQuantityChange={(qty) => {
            setQuantity(qty);
            if (!isAtCheckout && typeof window !== 'undefined') {
              setIsAtCheckout(true);
              window.history.pushState({ section: 'package-select', qty }, '');
            }
          }}
          onOrderClick={scrollToOrderForm}
          onImageClick={openLightbox}
        />

        {/* 2. Key Product Features: 4 essential concise benefits */}
        <ProductFeatures />

        {/* 3. ORDER FORM: Centered in the middle of the landing page */}
        <OrderForm
          quantity={quantity}
          onQuantityChange={setQuantity}
          productPrice={activeProduct.price}
          deliveryCharge={activeProduct.deliveryCharge}
          onOrderSuccess={openConfirmedOrder}
        />

        {/* 4. Product Video Section: 16:9 responsive showcase */}
        <ProductVideoSection onOrderClick={scrollToOrderForm} />

        {/* 5. Product Gallery: Authentic photographs & Lightbox zoom */}
        <ProductGallery
          onImageZoom={openLightbox}
          onOrderClick={scrollToOrderForm}
        />

        {/* 6. Usage Information: 3 simple steps */}
        <UsageGuide />

        {/* 8. FAQ Section: 4 crisp questions & answers */}
        <FaqSection />
      </main>

      {/* 11. Footer: China Hut branding, business address, email, map, policies */}
      <Footer onAdminClick={handleOpenAdmin} onPolicyClick={openPolicy} />

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
        onClose={closeLightbox}
      />

      {/* Order Confirmation Receipt Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={closeConfirmedOrder}
      />

      {/* Policy Dialog Modal */}
      <PolicyModal
        isOpen={Boolean(activePolicy)}
        type={activePolicy}
        onClose={closePolicy}
      />

      {/* 14. Admin Management Portal */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
      />
    </div>
  );
}
