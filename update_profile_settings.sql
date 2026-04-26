-- Update profiles table to support persistent notification settings
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notif_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notif_time TIME DEFAULT '07:00:00',
ADD COLUMN IF NOT EXISTS notif_settings JSONB DEFAULT '{"achievements": true, "streak": true, "summary": true, "coach": true, "hydration": true}'::jsonb;

-- Comment on columns for clarity
COMMENT ON COLUMN public.profiles.notif_enabled IS 'Master toggle for all push notifications';
COMMENT ON COLUMN public.profiles.notif_time IS 'Daily training reminder time (default 7 AM)';
COMMENT ON COLUMN public.profiles.notif_settings IS 'Individual toggles for different notification types (Logros, Racha, etc.)';
