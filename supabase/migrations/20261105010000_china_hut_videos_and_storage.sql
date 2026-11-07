-- ==============================================================================
-- CHINA HUT E-COMMERCE: VIDEOS & STORAGE MANAGEMENT MIGRATION
-- Target: Supabase (PostgreSQL 15+)
-- Version: 1.1.0 (Phase 3 - Videos & Storage)
-- ==============================================================================

-- 1. VIDEOS TABLE
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) >= 2),
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('product', 'promotional')),
  is_published BOOLEAN NOT NULL DEFAULT false,
  file_size BIGINT,
  duration INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS idx_videos_is_published ON public.videos(is_published);
CREATE INDEX IF NOT EXISTS idx_videos_category ON public.videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_created_at_desc ON public.videos(created_at DESC);

-- 3. UPDATED_AT TRIGGER
DROP TRIGGER IF EXISTS trigger_videos_updated_at ON public.videos;
CREATE TRIGGER trigger_videos_updated_at
BEFORE UPDATE ON public.videos
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Public can view only published videos
DROP POLICY IF EXISTS "Public can view published videos" ON public.videos;
CREATE POLICY "Public can view published videos"
ON public.videos
FOR SELECT
TO anon, authenticated
USING (is_published = true OR public.is_admin());

-- Admins can insert, update, delete videos
DROP POLICY IF EXISTS "Admins can manage videos" ON public.videos;
CREATE POLICY "Admins can manage videos"
ON public.videos
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. PERMISSIONS
GRANT SELECT ON public.videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.videos TO authenticated;

-- 6. SEED DEFAULT PRODUCT VIDEO
INSERT INTO public.videos (
  title,
  description,
  video_url,
  thumbnail_url,
  category,
  is_published
) VALUES (
  'সাউথমুন লাইপোমা রিমুভাল স্প্রে (৫০ মিলি) প্যাকেজিং ও ডেমো',
  'আসল আমদানিকৃত ইনট্যাক্ট বক্স ও ৫০ মিলি স্প্রে বোতল পরিচিতি ও ব্যবহার নির্দেশিকা।',
  '/assets/videos/products/southmoon_demo.mp4',
  '/assets/images/products/southmoon_box_and_bottle.png',
  'product',
  true
)
ON CONFLICT DO NOTHING;

-- 7. SUPABASE STORAGE BUCKETS (Execute via Supabase Dashboard or Storage API)
-- Bucket 1: 'products' (public: true) for product photography
-- Bucket 2: 'videos' (public: true) for high-definition MP4 showcase clips
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
-- Allow public to view objects in 'products' and 'videos'
DROP POLICY IF EXISTS "Public Access Products" ON storage.objects;
CREATE POLICY "Public Access Products"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Public Access Videos" ON storage.objects;
CREATE POLICY "Public Access Videos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'videos');

-- Allow authenticated admins to upload/manage in 'products' and 'videos'
DROP POLICY IF EXISTS "Admins Manage Products" ON storage.objects;
CREATE POLICY "Admins Manage Products"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'products' AND public.is_admin())
WITH CHECK (bucket_id = 'products' AND public.is_admin());

DROP POLICY IF EXISTS "Admins Manage Videos" ON storage.objects;
CREATE POLICY "Admins Manage Videos"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'videos' AND public.is_admin())
WITH CHECK (bucket_id = 'videos' AND public.is_admin());

