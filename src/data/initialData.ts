import { Product, SiteSettings } from '../types';
import { INITIAL_PRODUCT, BRAND_CONFIG } from '../config/constants';

export const defaultProductData: Product = {
  id: INITIAL_PRODUCT.id,
  name: INITIAL_PRODUCT.name,
  slug: INITIAL_PRODUCT.slug,
  brand: INITIAL_PRODUCT.brand,
  volume: INITIAL_PRODUCT.volume,
  price: INITIAL_PRODUCT.price,
  originalPrice: INITIAL_PRODUCT.originalPrice,
  deliveryCharge: INITIAL_PRODUCT.baseDeliveryCharge,
  stock: INITIAL_PRODUCT.stock,
  isAvailable: INITIAL_PRODUCT.isAvailable,
  sku: INITIAL_PRODUCT.sku,
  packagingClaims: [...INITIAL_PRODUCT.packagingClaims],
  description: INITIAL_PRODUCT.description,
  specifications: [...INITIAL_PRODUCT.specifications],
  usageInstructions: [...INITIAL_PRODUCT.usageInstructions],
  images: [
    {
      id: 'img-1',
      productId: INITIAL_PRODUCT.id,
      url: INITIAL_PRODUCT.images[0].url,
      altText: INITIAL_PRODUCT.images[0].alt,
      isPrimary: true,
      displayOrder: 1,
    },
    {
      id: 'img-2',
      productId: INITIAL_PRODUCT.id,
      url: INITIAL_PRODUCT.images[1].url,
      altText: INITIAL_PRODUCT.images[1].alt,
      isPrimary: false,
      displayOrder: 2,
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const defaultSiteSettings: SiteSettings = {
  brandName: BRAND_CONFIG.name,
  brandTagline: BRAND_CONFIG.tagline,
  contactPhone: BRAND_CONFIG.contact.phone,
  contactEmail: BRAND_CONFIG.contact.email,
  contactWhatsapp: BRAND_CONFIG.contact.whatsapp,
  defaultProductPrice: INITIAL_PRODUCT.price,
  defaultDeliveryCharge: INITIAL_PRODUCT.baseDeliveryCharge,
  gtmId: (import.meta.env.VITE_GTM_ID as string) || '',
  seoTitle: `${BRAND_CONFIG.name} - ${BRAND_CONFIG.tagline} | SouthMoon Lipoma Removal Spray`,
  seoDescription:
    'China Hut - সেরা পণ্য, সুলভ মূল্য। সাউথমুন লাইপোমা রিমুভাল স্প্রে (৫০ মিলি) সরাসরি ক্যাশ অন ডেলিভারিতে অর্ডার করুন।',
};
