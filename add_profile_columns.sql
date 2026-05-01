-- Agregar columnas de personalización deportiva al perfil
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sport_focus TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS main_objective TEXT;
