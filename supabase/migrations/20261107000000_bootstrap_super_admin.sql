-- ==============================================================================
-- CHINA HUT: FIRST SUPER ADMIN BOOTSTRAP PROMOTION
-- Target: Supabase SQL Editor
-- User Email: razibulh02@gmail.com
-- User UUID: a6fd20fa-169c-4eef-bab8-c1342094cba0
-- ==============================================================================

-- 1. Insert or Promote razibulh02@gmail.com to Super Admin
INSERT INTO public.admin_profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  'a6fd20fa-169c-4eef-bab8-c1342094cba0'::UUID,
  'razibulh02@gmail.com',
  'China Hut Super Admin',
  'super_admin'::public.admin_role,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin'::public.admin_role,
  email = EXCLUDED.email,
  updated_at = now();

-- 2. Verify Super Admin Activation
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.admin_profiles
WHERE id = 'a6fd20fa-169c-4eef-bab8-c1342094cba0'::UUID;
