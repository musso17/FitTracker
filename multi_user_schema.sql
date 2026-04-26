-- Este script añade la columna 'user_id' a la tabla 'logs' para habilitar multi-usuario.
-- También activa Row Level Security (RLS) para que cada usuario solo vea sus datos.

ALTER TABLE public.logs 
ADD COLUMN IF NOT EXISTS "user_id" uuid DEFAULT auth.uid();

ALTER TABLE public.logs
ADD COLUMN IF NOT EXISTS "muayThaiData" jsonb;

-- Habilitar RLS si no está habilitado
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas si existieran para evitar conflictos
DROP POLICY IF EXISTS "Permitir lectura anonima" ON public.logs;
DROP POLICY IF EXISTS "Permitir insercion anonima" ON public.logs;

-- Nueva Política: Los usuarios solo pueden ver sus propios registros
CREATE POLICY "Usuarios pueden ver sus propios logs"
ON public.logs FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Nueva Política: Los usuarios solo pueden insertar sus propios registros
CREATE POLICY "Usuarios pueden insertar sus propios logs"
ON public.logs FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);
