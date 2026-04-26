-- Este script añade la columna 'gymData' a la tabla 'logs'
-- y la usaremos para guardar pesos, repeticiones e información de ejercicios omitidos.

ALTER TABLE public.logs 
ADD COLUMN IF NOT EXISTS "gymData" jsonb;
