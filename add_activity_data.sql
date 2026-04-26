-- ==========================================
-- MIGRACIÓN: Añadir columna activityData a logs
-- ==========================================
-- Ejecuta este script en el "SQL Editor" de tu panel de Supabase.
-- Es idempotente: si la columna ya existe, no hace nada.

-- 1. Añadir columna activityData (jsonb) a la tabla logs
--    Almacena: { type: 'cycling', duration: 45, intensity: 'tempo' }
ALTER TABLE public.logs 
ADD COLUMN IF NOT EXISTS "activityData" jsonb;

-- 2. Añadir columna strength_goals a profiles (si no existe)
--    Almacena: { "m6": 80, "m11": 100 } — metas por ejercicio
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS "strength_goals" jsonb DEFAULT '{}'::jsonb;

-- 3. Verificación rápida
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'logs' AND table_schema = 'public'
ORDER BY ordinal_position;
