
-- Extensión para búsqueda inteligente (Fuzzy Search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Catálogo Maestro de Ejercicios (Fitness Ontology)
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  synonyms JSONB DEFAULT '[]', -- ["lagartijas", "despechadas", "planchas", "pushups"]
  movement_pattern TEXT NOT NULL, -- Squat, Hinge, Push Horizontal, Push Vertical, Pull Horizontal, Pull Vertical, Lunge, Rotation, Carry, Isolation
  equipment TEXT NOT NULL, -- Barbell, Dumbbell, Machine, Cable, Bodyweight, Kettlebell
  primary_muscle TEXT NOT NULL, -- Pectoral, Dorsal, Deltoides, Bíceps, Tríceps, Cuádriceps, Isquios, Glúteo, Core, Calves
  technical_tip_es TEXT,
  technical_tip_en TEXT,
  suggested_rest_sec INTEGER DEFAULT 90,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_exercises_name_es_trgm ON exercises USING gin (name_es gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_exercises_synonyms ON exercises USING gin (synonyms);

-- 2. Insertar Base de Datos Inicial (Ontología de la Investigación)
INSERT INTO exercises (name_es, name_en, synonyms, movement_pattern, equipment, primary_muscle, suggested_rest_sec, technical_tip_es)
VALUES 
-- EMPUJE (PUSH)
('Press de Banca con Barra', 'Barbell Bench Press', '["pecho plano", "bench press", "pecho con barra"]', 'Push Horizontal', 'Barbell', 'Pectoral', 180, 'Baja la barra hasta el pecho medio, mantén los codos a 45 grados.'),
('Press Militar con Barra', 'Barbell Overhead Press', '["press militar", "hombro barra", "overhead press"]', 'Push Vertical', 'Barbell', 'Deltoides', 120, 'Empuja verticalmente, bloquea codos arriba sin arquear la espalda.'),
('Flexiones de Brazos', 'Push-ups', '["lagartijas", "planchas", "despechadas"]', 'Push Horizontal', 'Bodyweight', 'Pectoral', 60, 'Cuerpo recto como una tabla, pecho al suelo.'),
('Press de Pecho en Máquina', 'Chest Press Machine', '["pecho máquina", "chest press"]', 'Push Horizontal', 'Machine', 'Pectoral', 90, 'Movimiento controlado, mantén las escápulas retraídas.'),
('Apertura de Pecho con Mancuernas', 'Dumbbell Flyes', '["aperturas", "pecho mancuernas"]', 'Isolation', 'Dumbbell', 'Pectoral', 60, 'Siente el estiramiento profundo, no choques las pesas arriba.'),

-- TRACCIÓN (PULL)
('Dominadas', 'Pull-ups', '["barra", "pullups", "dominada estricta"]', 'Pull Vertical', 'Bodyweight', 'Dorsal', 120, 'Pecho a la barra, no te balancees.'),
('Jalón al Pecho', 'Lat Pulldown', '["jalón polea", "lat pulldown"]', 'Pull Vertical', 'Cable', 'Dorsal', 90, 'Tira con los codos, siente la contracción en los dorsales.'),
('Remo con Barra', 'Barbell Row', '["remo inclinado", "bb row"]', 'Pull Horizontal', 'Barbell', 'Dorsal', 120, 'Tronco a 45-90 grados, tira hacia el ombligo.'),
('Remo con Mancuerna', 'Dumbbell Row', '["remo a una mano", "db row"]', 'Pull Horizontal', 'Dumbbell', 'Dorsal', 90, 'Evita rotar el tronco, máxima extensión abajo.'),
('Face Pulls', 'Face Pulls', '["polea a la cara", "facepull"]', 'Pull Horizontal', 'Cable', 'Deltoides Posterior', 60, 'Tira de la cuerda hacia la frente, codos altos.'),

-- TREN INFERIOR
('Sentadilla con Barra', 'Barbell Back Squat', '["squat", "sentadilla trasera", "patas"]', 'Squat', 'Barbell', 'Cuádriceps', 180, 'Baja rompiendo el paralelo, rodillas alineadas con pies.'),
('Peso Muerto Convencional', 'Conventional Deadlift', '["peso muerto", "fierros", "deadlift"]', 'Hinge', 'Barbell', 'Isquios', 180, 'Empuja el suelo con los pies, espalda neutra.'),
('Peso Muerto Rumano', 'Romanian Deadlift', '["rdl", "piernas rígidas"]', 'Hinge', 'Barbell', 'Isquios', 120, 'Baja la barra rozando piernas, siente el estiramiento en isquios.'),
('Hip Thrust con Barra', 'Barbell Hip Thrust', '["empuje de cadera", "nalgas"]', 'Hinge', 'Barbell', 'Glúteo', 120, 'Barbilla al pecho, máxima contracción arriba.'),
('Zancada Búlgara', 'Bulgarian Split Squat', '["estocada búlgara", "desplante búlgaro"]', 'Lunge', 'Dumbbell', 'Glúteo', 90, 'Mucha estabilidad, inclina torso para más glúteo.'),
('Prensa de Piernas', 'Leg Press', '["prensa", "leg press machine"]', 'Squat', 'Machine', 'Cuádriceps', 120, 'No bloquees las rodillas al extender, baja profundo.'),

-- CORE
('Plancha Frontal', 'Plank', '["core", "plancha", "tabla"]', 'Core', 'Bodyweight', 'Core', 60, 'Aprieta glúteos y abdomen, evita que caiga la cadera.'),
('Dead Bug', 'Dead Bug', '["escarabajo", "core suave"]', 'Core', 'Bodyweight', 'Core', 45, 'Coordina brazo y pierna contraria sin despegar la lumbar.'),
('Giros Rusos', 'Russian Twists', '["oblicuos", "giros abdominales"]', 'Rotation', 'Bodyweight', 'Core', 45, 'Mueve el torso completo, no solo los brazos.');

-- 3. Actualizar la tabla de logs para soportar RPE/RIR y IDs de ejercicios opcionales
-- Nota: Mantenemos gymData como JSONB para flexibilidad pero añadimos campos específicos si prefieres normalizar
-- Por ahora, ampliaremos los inputs de la sesión activa en el frontend.
