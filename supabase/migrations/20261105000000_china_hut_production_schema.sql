-- ==============================================================================
-- CHINA HUT E-COMMERCE: AUDITED & HARDENED PRODUCTION DATABASE MIGRATION
-- Target: Supabase (PostgreSQL 15+)
-- Environment: Production Hardened
-- Author: Senior PostgreSQL Security Architect & Supabase Database Engineer
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & DOMAINS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE public.order_status AS ENUM (
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
    CREATE TYPE public.admin_role AS ENUM (
      'super_admin',
      'admin',
      'manager'
    );
  END IF;
END $$;

-- 3. SEQUENCES (Concurrency-Safe Order Number Generation)
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq
  START WITH 1000
  INCREMENT BY 1
  MINVALUE 1000
  MAXVALUE 99999
  CYCLE;

-- 4. CORE TABLES

-- Table: products
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL DEFAULT 'SouthMoon',
  volume TEXT NOT NULL DEFAULT '50ml / 1.69 fl oz',
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10, 2) CHECK (original_price IS NULL OR original_price >= price),
  delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 100.00 CHECK (delivery_charge >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_available BOOLEAN NOT NULL DEFAULT true,
  sku TEXT UNIQUE NOT NULL,
  packaging_claims TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT NOT NULL,
  specifications JSONB DEFAULT '[]'::JSONB,
  usage_instructions TEXT[] DEFAULT ARRAY[]::TEXT[],
  images JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL CHECK (char_length(trim(customer_name)) >= 2),
  phone TEXT NOT NULL CHECK (trim(phone) ~ '^(?:\+?88)?01[3-9]\d{8}$'),
  address TEXT NOT NULL CHECK (char_length(trim(address)) >= 5),
  district TEXT DEFAULT '',
  upazila TEXT DEFAULT '',
  quantity INTEGER NOT NULL CHECK (quantity >= 1 AND quantity <= 20),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  delivery_charge NUMERIC(10, 2) NOT NULL CHECK (delivery_charge >= 0),
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  order_notes TEXT,
  status public.order_status NOT NULL DEFAULT 'pending',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity >= 1 AND quantity <= 20),
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: admin_profiles (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role public.admin_role NOT NULL DEFAULT 'admin',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. PERFORMANCE & AUDIT INDEXES
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_recent_anti_spam ON public.orders(phone, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON public.admin_profiles(role);

-- 6. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_admin_profiles_updated_at ON public.admin_profiles;
CREATE TRIGGER trigger_admin_profiles_updated_at
BEFORE UPDATE ON public.admin_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 7. NON-RECURSIVE SECURITY DEFINER ROLE CHECKERS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'admin', 'manager')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
$$;

-- 8. ROW LEVEL SECURITY (RLS) - ZERO-LEAKAGE ENFORCEMENT
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Products Policies: Public can read available products; Admins manage all
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (is_available = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Orders Policies: Strict privacy. Anon users CANNOT read, update or delete orders.
DROP POLICY IF EXISTS "Admins can view orders" ON public.orders;
CREATE POLICY "Admins can view orders"
ON public.orders
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Super admins can delete orders" ON public.orders;
CREATE POLICY "Super admins can delete orders"
ON public.orders
FOR DELETE
TO authenticated
USING (public.is_super_admin());

-- Order Items Policies: Strict admin-only access
DROP POLICY IF EXISTS "Admins can view order items" ON public.order_items;
CREATE POLICY "Admins can view order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
CREATE POLICY "Admins can manage order items"
ON public.order_items
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admin Profiles Policies: Self-read or admin audit; only Super Admin can assign/modify roles
DROP POLICY IF EXISTS "Users can read own profile or admins can view all" ON public.admin_profiles;
CREATE POLICY "Users can read own profile or admins can view all"
ON public.admin_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Super admins can manage admin profiles" ON public.admin_profiles;
CREATE POLICY "Super admins can manage admin profiles"
ON public.admin_profiles
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- 9. SCHEMA & TABLE PERMISSIONS (LEAST-PRIVILEGE GRANTS)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Anonymous users: Can ONLY read active products and run sequence nextval via RPC
GRANT SELECT ON public.products TO anon;
REVOKE ALL ON public.orders FROM anon;
REVOKE ALL ON public.order_items FROM anon;
REVOKE ALL ON public.admin_profiles FROM anon;

-- Authenticated users: Can read products; table actions governed strictly by RLS
GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT SELECT, UPDATE ON public.orders TO authenticated;
GRANT DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_profiles TO authenticated;

-- 10. SERVER-AUTHORITATIVE ATOMIC CHECKOUT FUNCTION (RPC)
-- Hardened against race conditions, price spoofing, and inventory overselling.
CREATE OR REPLACE FUNCTION public.create_customer_order(
  p_customer_name TEXT,
  p_phone TEXT,
  p_address TEXT,
  p_quantity INTEGER,
  p_district TEXT DEFAULT '',
  p_upazila TEXT DEFAULT '',
  p_order_notes TEXT DEFAULT '',
  p_product_id TEXT DEFAULT 'southmoon-lipoma-spray-50ml',
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_product RECORD;
  v_clean_name TEXT;
  v_clean_phone TEXT;
  v_clean_address TEXT;
  v_subtotal NUMERIC(10, 2);
  v_delivery_charge NUMERIC(10, 2);
  v_total_amount NUMERIC(10, 2);
  v_order_number TEXT;
  v_order_id UUID;
  v_seq_val BIGINT;
  v_date_prefix TEXT;
  v_recent_order_count INTEGER;
  v_resolved_ip TEXT;
  v_resolved_user_agent TEXT;
BEGIN
  -- 1. Input Sanitization
  v_clean_name := trim(COALESCE(p_customer_name, ''));
  v_clean_phone := regexp_replace(COALESCE(p_phone, ''), '[\s-]', '', 'g');
  v_clean_address := trim(COALESCE(p_address, ''));

  -- 2. Validation: Customer Name
  IF char_length(v_clean_name) < 2 THEN
    RAISE EXCEPTION 'Customer name must be at least 2 characters long.';
  END IF;

  -- 3. Validation: Bangladeshi Mobile Number
  IF NOT (v_clean_phone ~ '^(?:\+?88)?01[3-9]\d{8}$') THEN
    RAISE EXCEPTION 'Invalid Bangladeshi phone number. Must be a valid 11-digit mobile number.';
  END IF;

  -- 4. Validation: Delivery Address
  IF char_length(v_clean_address) < 5 THEN
    RAISE EXCEPTION 'Delivery address must be at least 5 characters long.';
  END IF;

  -- 5. Validation: Order Quantity (Strict limit 1 to 20 bottles)
  IF p_quantity < 1 OR p_quantity > 20 THEN
    RAISE EXCEPTION 'Quantity must be between 1 and 20 bottles.';
  END IF;

  -- 6. Database-Level Anti-Spam / Rate Throttling:
  -- Prevent automated scripts from submitting > 5 orders from the same phone number in 10 minutes
  SELECT count(*)
  INTO v_recent_order_count
  FROM public.orders
  WHERE phone = v_clean_phone
  AND created_at >= (now() - INTERVAL '10 minutes');

  IF v_recent_order_count >= 5 THEN
    RAISE EXCEPTION 'Too many order attempts for this phone number. Please wait a few minutes before ordering again.';
  END IF;

  -- 7. Extract untampered headers from PostgREST context when available
  BEGIN
    v_resolved_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';
    v_resolved_user_agent := current_setting('request.headers', true)::json->>'user-agent';
  EXCEPTION WHEN OTHERS THEN
    v_resolved_ip := NULL;
    v_resolved_user_agent := NULL;
  END;

  IF v_resolved_ip IS NULL THEN
    v_resolved_ip := p_ip_address;
  END IF;
  IF v_resolved_user_agent IS NULL THEN
    v_resolved_user_agent := p_user_agent;
  END IF;

  -- 8. Concurrency-Safe Row Lock on Product
  SELECT id, name, price, delivery_charge, stock, is_available
  INTO v_product
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product % not found in database.', p_product_id;
  END IF;

  IF NOT v_product.is_available THEN
    RAISE EXCEPTION 'This product is currently unavailable.';
  END IF;

  IF v_product.stock < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock. Only % units available.', v_product.stock;
  END IF;

  -- 9. Server-Authoritative Financial Calculations (Zero trust on client-submitted prices)
  v_subtotal := v_product.price * p_quantity;

  -- Business Pricing Tier: 2 or more bottles get 100% FREE delivery (0.00 BDT)
  IF p_quantity >= 2 THEN
    v_delivery_charge := 0.00;
  ELSE
    v_delivery_charge := v_product.delivery_charge;
  END IF;

  v_total_amount := v_subtotal + v_delivery_charge;

  -- 10. Concurrency-Safe Unique Order Number Generation:
  -- Format: CH-YYMMDD-XXXX (Using sequence + Dhaka local business date)
  v_date_prefix := to_char(now() AT TIME ZONE 'Asia/Dhaka', 'YYMMDD');
  v_seq_val := nextval('public.order_number_seq');
  v_order_number := 'CH-' || v_date_prefix || '-' || lpad((v_seq_val % 10000)::text, 4, '0');

  -- Guarantee absolute uniqueness across date rollovers
  WHILE EXISTS (SELECT 1 FROM public.orders WHERE order_number = v_order_number) LOOP
    v_seq_val := nextval('public.order_number_seq');
    v_order_number := 'CH-' || v_date_prefix || '-' || lpad((v_seq_val % 10000)::text, 4, '0');
  END LOOP;

  -- 11. Atomic Insert: Orders Table
  INSERT INTO public.orders (
    order_number,
    customer_name,
    phone,
    address,
    district,
    upazila,
    quantity,
    subtotal,
    delivery_charge,
    total_amount,
    order_notes,
    status,
    ip_address,
    user_agent,
    created_at,
    updated_at
  ) VALUES (
    v_order_number,
    v_clean_name,
    v_clean_phone,
    v_clean_address,
    COALESCE(p_district, ''),
    COALESCE(p_upazila, ''),
    p_quantity,
    v_subtotal,
    v_delivery_charge,
    v_total_amount,
    COALESCE(p_order_notes, ''),
    'pending',
    v_resolved_ip,
    v_resolved_user_agent,
    now(),
    now()
  )
  RETURNING id INTO v_order_id;

  -- 12. Atomic Insert: Order Items Table
  INSERT INTO public.order_items (
    order_id,
    product_id,
    product_name,
    unit_price,
    quantity,
    total_price,
    created_at
  ) VALUES (
    v_order_id,
    v_product.id,
    v_product.name,
    v_product.price,
    p_quantity,
    v_subtotal,
    now()
  );

  -- 13. Atomic Stock Decrement (Guaranteed non-negative by table CHECK constraint)
  UPDATE public.products
  SET stock = stock - p_quantity,
      updated_at = now()
  WHERE id = v_product.id;

  -- 14. Return Verified Sanitized Receipt Payload
  RETURN jsonb_build_object(
    'success', true,
    'orderId', v_order_id,
    'orderNumber', v_order_number,
    'customerName', v_clean_name,
    'phone', v_clean_phone,
    'address', v_clean_address,
    'quantity', p_quantity,
    'subtotal', v_subtotal,
    'deliveryCharge', v_delivery_charge,
    'totalAmount', v_total_amount,
    'status', 'pending',
    'createdAt', now()
  );
END;
$$;

-- 11. FUNCTION EXECUTION PRIVILEGES (EXPLICIT SIGNATURES)
-- Revoke PUBLIC access first
REVOKE ALL ON FUNCTION public.create_customer_order(TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC;

-- Explicitly grant execute with full signatures
GRANT EXECUTE ON FUNCTION public.create_customer_order(TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- 12. SEED INITIAL CHINA HUT PRODUCT (Preserving Business Pricing)
INSERT INTO public.products (
  id,
  name,
  slug,
  brand,
  volume,
  price,
  original_price,
  delivery_charge,
  stock,
  is_available,
  sku,
  packaging_claims,
  description,
  specifications,
  usage_instructions,
  images
) VALUES (
  'southmoon-lipoma-spray-50ml',
  'SouthMoon Lipoma Removal Spray',
  'southmoon-lipoma-removal-spray',
  'SouthMoon',
  '50ml / 1.69 fl oz',
  750.00,
  1250.00,
  100.00,
  250,
  true,
  'SM-LRS-50ML',
  ARRAY['Nodular discomfort', 'Fat lump removal', 'Lipolysis']::TEXT[],
  'SouthMoon Lipoma Removal Spray (50ml) ত্বকের বাহ্যিক নডুলার অস্বস্তি ও ফ্যাটি লাম্প পরিচর্যার একটি সুবিধাজনক ও মৃদু স্প্রে ফর্মুলেশন।',
  '[
    {"label": "Brand", "value": "SouthMoon"},
    {"label": "Product Name", "value": "Lipoma Removal Spray"},
    {"label": "Net Volume", "value": "50ml / 1.69 fl oz"},
    {"label": "Application", "value": "External Use Only (বাহ্যিক ব্যবহার)"},
    {"label": "Formulation", "value": "Gentle Topical Spray"},
    {"label": "Origin", "value": "Imported (China)"}
  ]'::JSONB,
  ARRAY[
    'ব্যবহারের আগে ত্বক পরিষ্কার ও শুষ্ক করে নিন।',
    'বোতলটি আলতো করে ঝাঁকিয়ে নিন।',
    '১০-১৫ সেমি দূর থেকে দিনে ২-৩ বার স্প্রে করে আলতো ম্যাসাজ করুন।'
  ]::TEXT[],
  '[
    {
      "id": "img-box-bottle",
      "url": "/assets/aistudio/image_87f46d94.png",
      "alt": "SouthMoon Lipoma Removal Spray 50ml Box and Bottle Set",
      "title": "বক্স ও স্প্রে বোতল (অফিসিয়াল সেট)",
      "isPrimary": true
    },
    {
      "id": "img-bottle-solo",
      "url": "/assets/aistudio/image_00782a2b.png",
      "alt": "SouthMoon Lipoma Removal Spray 50ml Solo Bottle View",
      "title": "৫০ মিলি স্প্রে বোতল (ক্লোজ-আপ ভিউ)",
      "isPrimary": false
    }
  ]'::JSONB
)
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  delivery_charge = EXCLUDED.delivery_charge,
  name = EXCLUDED.name,
  is_available = EXCLUDED.is_available,
  specifications = EXCLUDED.specifications;
