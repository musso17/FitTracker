-- ==========================================
-- SQL DEFINITIVO PARA FIT & SURF TRACKER
-- ==========================================
-- Este script configura TODAS las columnas necesarias y la privacidad (RLS).
-- Ejecuta esto en el "SQL Editor" de tu panel de Supabase.

-- 1. Asegurar que las columnas existan
ALTER TABLE public.logs 
ADD COLUMN IF NOT EXISTS "gymData" jsonb,
ADD COLUMN IF NOT EXISTS "muayThaiData" jsonb,
ADD COLUMN IF NOT EXISTS "user_id" uuid DEFAULT auth.uid();

-- 2. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- 3. Limpiar políticas antiguas (para evitar errores de duplicado)
DROP POLICY IF EXISTS "Permitir lectura anonima" ON public.logs;
DROP POLICY IF EXISTS "Permitir insercion anonima" ON public.logs;
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios logs" ON public.logs;
DROP POLICY IF EXISTS "Usuarios pueden insertar sus propios logs" ON public.logs;

-- 4. Crear Política de Lectura: Cada usuario ve solo sus datos
CREATE POLICY "Usuarios pueden ver sus propios logs"
ON public.logs FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 5. Crear Política de Inserción: Cada usuario guarda solo sus datos
CREATE POLICY "Usuarios pueden insertar sus propios logs"
ON public.logs FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 6. Opcional: Política de Actualización (si necesitas editar logs)
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propios logs" ON public.logs;
CREATE POLICY "Usuarios pueden actualizar sus propios logs"
ON public.logs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. Opcional: Política de Borrado
DROP POLICY IF EXISTS "Usuarios pueden borrar sus propios logs" ON public.logs;
CREATE POLICY "Usuarios pueden borrar sus propios logs"
ON public.logs FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
