import { GtmEventPayload, Order, Product } from '../types';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * PII Protection Rule:
 * We strictly filter out customer phone numbers, names, personal addresses,
 * and notes to prevent sending sensitive customer data to Google Tag Manager / third-party tags.
 */

export function pushToDataLayer(payload: GtmEventPayload): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);

  if (import.meta.env.DEV) {
    console.debug('[GTM Event]', payload.event, payload);
  }
}

export function initGTM(gtmId?: string): void {
  if (typeof window === 'undefined') return;
  const id = gtmId || (import.meta.env.VITE_GTM_ID as string);
  if (!id || id.includes('XXXXXXX')) {
    return;
  }

  // Prevent multiple script insertions
  if (document.getElementById('gtm-script')) return;

  const script = document.createElement('script');
  script.id = 'gtm-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;
  document.head.appendChild(script);

  pushToDataLayer({
    event: 'gtm.js',
    'gtm.start': new Date().getTime(),
  });
}

export function trackPageView(pagePath: string, pageTitle: string): void {
  pushToDataLayer({
    event: 'page_view',
    page_path: pagePath,
    page_title: pageTitle,
  });
}

export function trackViewItem(product: Product): void {
  pushToDataLayer({
    event: 'view_item',
    ecommerce: {
      currency: 'BDT',
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: 1,
          currency: 'BDT',
        },
      ],
    },
  });
}

export function trackAddToCart(product: Product, quantity: number): void {
  pushToDataLayer({
    event: 'add_to_cart',
    ecommerce: {
      currency: 'BDT',
      value: product.price * quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity,
          currency: 'BDT',
        },
      ],
    },
  });
}

export function trackBeginCheckout(product: Product, quantity: number): void {
  pushToDataLayer({
    event: 'begin_checkout',
    ecommerce: {
      currency: 'BDT',
      value: product.price * quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity,
          currency: 'BDT',
        },
      ],
    },
  });
}

export function trackPurchase(order: Order, product: Product): void {
  // Prevent duplicate purchase events
  const storageKey = `gtm_purchased_${order.id}`;
  if (typeof window !== 'undefined' && sessionStorage.getItem(storageKey)) {
    return;
  }

  pushToDataLayer({
    event: 'purchase',
    ecommerce: {
      transaction_id: order.orderNumber || order.id,
      value: order.totalAmount,
      currency: 'BDT',
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: order.quantity,
          currency: 'BDT',
        },
      ],
    },
  });

  if (typeof window !== 'undefined') {
    sessionStorage.setItem(storageKey, 'true');
  }
}
