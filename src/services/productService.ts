import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product } from '../types';
import { INITIAL_PRODUCT } from '../config/constants';

const LOCAL_PRODUCTS_KEY = 'china_hut_local_products';

/**
 * Returns default fallback product list.
 */
function getDefaultProducts(): Product[] {
  return [
    {
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
      packagingClaims: INITIAL_PRODUCT.packagingClaims,
      description: INITIAL_PRODUCT.description,
      specifications: INITIAL_PRODUCT.specifications,
      usageInstructions: INITIAL_PRODUCT.usageInstructions,
      images: INITIAL_PRODUCT.images.map((img, idx) => ({
        id: img.id,
        productId: INITIAL_PRODUCT.id,
        url: img.url,
        altText: img.alt,
        isPrimary: idx === 0,
        displayOrder: idx,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

/**
 * Reads locally stored products.
 */
export function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (!raw) return getDefaultProducts();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getDefaultProducts();
  } catch {
    return getDefaultProducts();
  }
}

/**
 * Saves products to local storage cache.
 */
export function saveLocalProducts(products: Product[]) {
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  } catch (err) {
    console.warn('Could not save local products:', err);
  }
}

/**
 * Fetches all products (for Admin).
 */
export async function fetchAllProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          brand: item.brand || 'SouthMoon',
          volume: item.volume || '50ml',
          price: Number(item.price),
          originalPrice: item.original_price ? Number(item.original_price) : undefined,
          deliveryCharge: item.delivery_charge !== undefined && item.delivery_charge !== null ? Number(item.delivery_charge) : INITIAL_PRODUCT.baseDeliveryCharge,
          stock: Number(item.stock || 0),
          isAvailable: Boolean(item.is_available),
          sku: item.sku || '',
          packagingClaims: item.packaging_claims || [],
          description: item.description || '',
          specifications: item.specifications || [],
          usageInstructions: item.usage_instructions || [],
          images: Array.isArray(item.images) ? item.images : [],
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetchAllProducts error:', err);
    }
  }

  return getLocalProducts();
}

/**
 * Fetches active primary product for customer landing page.
 */
export async function fetchActivePrimaryProduct(): Promise<Product> {
  const all = await fetchAllProducts();
  const active = all.find((p) => p.isAvailable);
  return active || all[0] || getDefaultProducts()[0];
}

/**
 * Creates a new product in database and local cache.
 */
export async function createProduct(product: Omit<Product, 'createdAt' | 'updatedAt'>): Promise<Product> {
  const now = new Date().toISOString();
  const newProduct: Product = {
    ...product,
    createdAt: now,
    updatedAt: now,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          id: newProduct.id,
          name: newProduct.name,
          slug: newProduct.slug,
          brand: newProduct.brand,
          volume: newProduct.volume,
          price: newProduct.price,
          original_price: newProduct.originalPrice,
          delivery_charge: newProduct.deliveryCharge,
          stock: newProduct.stock,
          is_available: newProduct.isAvailable,
          sku: newProduct.sku,
          packaging_claims: newProduct.packagingClaims,
          description: newProduct.description,
          specifications: newProduct.specifications,
          usage_instructions: newProduct.usageInstructions,
          images: newProduct.images,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase createProduct error:', error);
      } else if (data) {
        newProduct.createdAt = data.created_at;
        newProduct.updatedAt = data.updated_at;
      }
    } catch (err) {
      console.warn('createProduct remote failed, falling back:', err);
    }
  }

  const local = getLocalProducts();
  saveLocalProducts([newProduct, ...local.filter((p) => p.id !== newProduct.id)]);
  return newProduct;
}

/**
 * Updates an existing product.
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      const dbUpdates: Record<string, unknown> = {
        updated_at: now,
      };
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
      if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
      if (updates.volume !== undefined) dbUpdates.volume = updates.volume;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice;
      if (updates.deliveryCharge !== undefined) dbUpdates.delivery_charge = updates.deliveryCharge;
      if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
      if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;
      if (updates.sku !== undefined) dbUpdates.sku = updates.sku;
      if (updates.packagingClaims !== undefined) dbUpdates.packaging_claims = updates.packagingClaims;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.specifications !== undefined) dbUpdates.specifications = updates.specifications;
      if (updates.usageInstructions !== undefined) dbUpdates.usage_instructions = updates.usageInstructions;
      if (updates.images !== undefined) dbUpdates.images = updates.images;

      const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
      if (error) {
        console.error('Supabase updateProduct error:', error);
      }
    } catch (err) {
      console.warn('updateProduct exception:', err);
    }
  }

  const local = getLocalProducts();
  const updated = local.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: now } : p));
  saveLocalProducts(updated);
  return true;
}

/**
 * Deletes a product.
 */
export async function deleteProduct(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteProduct error:', error);
      }
    } catch (err) {
      console.warn('deleteProduct remote error:', err);
    }
  }

  const local = getLocalProducts();
  saveLocalProducts(local.filter((p) => p.id !== id));
  return true;
}

/**
 * Uploads a product image to Supabase Storage bucket 'products'.
 * Falls back to local data URL if bucket is not yet provisioned.
 */
export async function uploadProductImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'png';
  const fileName = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

  if (isSupabaseConfigured && supabase) {
    try {
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!uploadError) {
        const { data } = supabase.storage.from('products').getPublicUrl(fileName);
        if (data?.publicUrl) {
          return data.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload error, falling back:', uploadError);
      }
    } catch (err) {
      console.warn('uploadProductImage exception, using fallback reader:', err);
    }
  }

  // Fallback to FileReader base64 URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}
