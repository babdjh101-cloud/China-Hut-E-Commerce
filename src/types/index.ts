/**
 * China Hut E-Commerce Types
 * Core Domain Models & Schemas
 */

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  volume: string;
  price: number;
  originalPrice?: number;
  deliveryCharge: number;
  stock: number;
  isAvailable: boolean;
  sku: string;
  packagingClaims: string[];
  description: string;
  specifications: ProductSpecification[];
  usageInstructions: string[];
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id?: string;
  orderId?: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  district: string;
  upazila: string;
  quantity: number;
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  orderNotes?: string;
  status: OrderStatus;
  items?: OrderItem[];
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  brandName: string;
  brandTagline: string;
  logoUrl?: string;
  contactPhone: string;
  contactEmail: string;
  contactWhatsapp: string;
  defaultProductPrice: number;
  defaultDeliveryCharge: number;
  gtmId?: string;
  seoTitle: string;
  seoDescription: string;
  updatedAt?: string;
}

export interface AdminProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'admin' | 'manager';
  lastLogin?: string;
}

export interface GtmEcommerceItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  currency: 'BDT';
}

export interface GtmEventPayload {
  event: string;
  ecommerce?: {
    currency: 'BDT';
    value?: number;
    transaction_id?: string;
    items: GtmEcommerceItem[];
  };
  [key: string]: unknown;
}

export type VideoCategory = 'product' | 'promotional';

export interface VideoItem {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category: VideoCategory;
  isPublished: boolean;
  fileSize?: number;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}
