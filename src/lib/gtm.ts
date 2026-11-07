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

  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.debug('[GTM Event]', payload.event, payload);
  }
}

export const DEFAULT_GTM_ID = 'GTM-53BB4H6D';

export function initGTM(gtmId?: string): void {
  if (typeof window === 'undefined') return;
  const id = gtmId || (import.meta.env.VITE_GTM_ID as string) || DEFAULT_GTM_ID;
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

export function trackViewItem(product: { id: string; name: string; price: number }): void {
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

export function trackAddToCart(
  product: { id: string; name: string; price: number },
  quantity: number,
  totalValue?: number
): void {
  const value = totalValue !== undefined ? totalValue : product.price * quantity;
  pushToDataLayer({
    event: 'add_to_cart',
    ecommerce: {
      currency: 'BDT',
      value,
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

export function trackBeginCheckout(
  product: { id: string; name: string; price: number },
  quantity: number,
  totalValue?: number
): void {
  const value = totalValue !== undefined ? totalValue : product.price * quantity;
  pushToDataLayer({
    event: 'begin_checkout',
    ecommerce: {
      currency: 'BDT',
      value,
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

export function trackPurchase(
  order: Order,
  product?: { id: string; name: string; price: number }
): void {
  const prodId = product?.id || 'southmoon-lipoma-spray-50ml';
  const prodName = product?.name || 'SouthMoon Lipoma Removal Spray (50ml)';
  const prodPrice = product?.price || (order.quantity === 2 ? 790 : 830);

  // Prevent duplicate purchase events
  const storageKey = `gtm_purchased_${order.id || order.orderNumber}`;
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(storageKey)) {
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
          item_id: prodId,
          item_name: prodName,
          price: prodPrice,
          quantity: order.quantity,
          currency: 'BDT',
        },
      ],
    },
  });

  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(storageKey, 'true');
    } catch {
      // Ignore private browsing quota errors
    }
  }
}

/**
 * Tracks WhatsApp button click leads.
 */
export function trackWhatsAppClick(source: string, quantity: number, totalAmount: number): void {
  pushToDataLayer({
    event: 'whatsapp_click',
    event_category: 'lead',
    source,
    quantity,
    value: totalAmount,
    currency: 'BDT',
  });
}

/**
 * Tracks Product video plays and user engagement.
 */
export function trackVideoInteraction(action: 'play' | 'pause' | 'watch_end', videoTitle?: string): void {
  pushToDataLayer({
    event: 'video_interaction',
    event_category: 'media',
    video_action: action,
    video_title: videoTitle || 'SouthMoon Lipoma Demo Video',
  });
}

/**
 * Tracks package offer clicks (Offer 1: 1 bottle, Offer 2: 2 bottles).
 */
export function trackPackageSelect(packageName: string, quantity: number, price: number): void {
  pushToDataLayer({
    event: 'select_package',
    package_name: packageName,
    quantity,
    value: price,
    currency: 'BDT',
  });
}

