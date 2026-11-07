import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Order, OrderStatus, Product } from '../types';
import { calculateOrderTotals } from '../lib/currency';

const LOCAL_STORAGE_KEY = 'china_hut_local_orders';

export interface CheckoutInput {
  customerName: string;
  phone: string;
  address: string;
  quantity: number;
  district?: string;
  upazila?: string;
  orderNotes?: string;
  productId?: string;
  productPrice?: number;
  deliveryCharge?: number;
}

/**
 * Reads any offline/locally cached orders from localStorage.
 */
export function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Appends an order to the local cache.
 */
function saveLocalOrder(order: Order) {
  try {
    const existing = getLocalOrders();
    const updated = [order, ...existing.filter((o) => o.id !== order.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
  } catch (err) {
    console.warn('Could not cache order to localStorage:', err);
  }
}

/**
 * Submits customer order atomically to Supabase via create_customer_order RPC.
 * Falls back safely to offline storage if remote connection is disrupted.
 */
export async function submitOrder(input: CheckoutInput): Promise<Order> {
  const cleanName = input.customerName.trim();
  const cleanPhone = input.phone.trim().replace(/[\s-]/g, '');
  const cleanAddress = input.address.trim();
  const quantity = Math.max(1, Math.min(20, input.quantity));

  // If Supabase is configured, submit via RPC
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc('create_customer_order', {
        p_customer_name: cleanName,
        p_phone: cleanPhone,
        p_address: cleanAddress,
        p_quantity: quantity,
        p_district: input.district || '',
        p_upazila: input.upazila || '',
        p_order_notes: input.orderNotes || '',
        p_product_id: input.productId || 'southmoon-lipoma-spray-50ml',
      });

      if (error) {
        console.error('Supabase RPC Order Error:', error);
        throw error;
      }

      if (data && data.success) {
        const order: Order = {
          id: data.orderId,
          orderNumber: data.orderNumber,
          customerName: data.customerName,
          phone: data.phone,
          address: data.address,
          district: input.district || '',
          upazila: input.upazila || '',
          quantity: data.quantity,
          subtotal: Number(data.subtotal),
          deliveryCharge: Number(data.deliveryCharge),
          totalAmount: Number(data.totalAmount),
          orderNotes: input.orderNotes || '',
          status: (data.status as OrderStatus) || 'pending',
          createdAt: data.createdAt,
          updatedAt: data.createdAt,
        };

        saveLocalOrder(order);
        return order;
      }
    } catch (rpcErr) {
      console.warn('RPC submission failed, engaging robust client fallback:', rpcErr);
    }
  }

  // Fallback calculation in case RPC is unreachable
  const pricing = calculateOrderTotals(input.productPrice || 830, quantity, input.deliveryCharge || 0);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const orderNumber = `CH-${dateStr}-${randomSuffix}`;
  const now = new Date().toISOString();

  const fallbackOrder: Order = {
    id: crypto.randomUUID ? crypto.randomUUID() : `ord_${Date.now()}`,
    orderNumber,
    customerName: cleanName,
    phone: cleanPhone,
    address: cleanAddress,
    district: input.district || '',
    upazila: input.upazila || '',
    quantity,
    subtotal: pricing.subtotal,
    deliveryCharge: pricing.deliveryCharge,
    totalAmount: pricing.total,
    orderNotes: input.orderNotes || '',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  saveLocalOrder(fallbackOrder);
  return fallbackOrder;
}

/**
 * Fetches all orders for the Admin Dashboard.
 */
export async function fetchAdminOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching orders from Supabase (may require admin login):', error);
      } else if (data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          orderNumber: item.order_number,
          customerName: item.customer_name,
          phone: item.phone,
          address: item.address,
          district: item.district || '',
          upazila: item.upazila || '',
          quantity: item.quantity,
          subtotal: Number(item.subtotal),
          deliveryCharge: Number(item.delivery_charge),
          totalAmount: Number(item.total_amount),
          orderNotes: item.order_notes || '',
          status: item.status as OrderStatus,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));
      }
    } catch (err) {
      console.error('fetchAdminOrders exception:', err);
    }
  }

  return getLocalOrders();
}

/**
 * Updates order status in Supabase.
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) {
        console.error('Failed to update status in Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('updateOrderStatus error:', err);
      return false;
    }
  }

  // Update local storage if offline
  try {
    const local = getLocalOrders();
    const updated = local.map((o) => (o.id === orderId ? { ...o, status } : o));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetches product stock and pricing from Supabase.
 */
export async function fetchLiveProduct(productId = 'southmoon-lipoma-spray-50ml'): Promise<Partial<Product> | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          price: Number(data.price),
          originalPrice: data.original_price ? Number(data.original_price) : undefined,
          deliveryCharge: Number(data.delivery_charge),
          stock: data.stock,
          isAvailable: data.is_available,
        };
      }
    } catch (err) {
      console.warn('Could not fetch live product:', err);
    }
  }
  return null;
}

/**
 * Updates product stock in Supabase.
 */
export async function updateLiveProductStock(productId: string, stock: number): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock, updated_at: new Date().toISOString() })
        .eq('id', productId);

      return !error;
    } catch {
      return false;
    }
  }
  return false;
}
