
-- Importar ejercicios actuales de plans.tsx al catálogo maestro
-- Esto permite que el sistema de reconocimiento reconozca los nombres actuales

INSERT INTO exercises (name_es, name_en, movement_pattern, equipment, primary_muscle, technical_tip_es)
VALUES 
-- Ana's Plan
('Plancha frontal', 'Front Plank', 'Core', 'Bodyweight', 'Core', 'Cuerpo recto, aprieta abdomen.'),
('Plancha lateral', 'Side Plank', 'Core', 'Bodyweight', 'Core', 'Codo bajo el hombro, cadera arriba.'),
('Dead bug', 'Dead Bug', 'Core', 'Bodyweight', 'Core', 'Mueve brazo y pierna opuesta sin arquear la lumbar.'),
('Bird dog', 'Bird Dog', 'Core', 'Bodyweight', 'Core', 'Estira brazo y pierna opuesta, mantén estabilidad.'),
('Hip thrust pesado', 'Barbell Hip Thrust', 'Hinge', 'Barbell', 'Glúteo', 'Aprieta glúteos arriba 1s.'),
('Goblet squat', 'Goblet Squat', 'Squat', 'Dumbbell', 'Cuádriceps', 'Pecho arriba, baja controlado.'),
('RDL (Peso muerto rumano)', 'Romanian Deadlift', 'Hinge', 'Barbell', 'Isquios', 'Caderas hacia atrás, siente el estiramiento.'),
('Bulgarian split squat', 'Bulgarian Split Squat', 'Squat', 'Dumbbell', 'Cuádriceps', 'Inclina el torso ligeramente adelante.'),
('Abducciones', 'Glute Abductions', 'Isolation', 'Machine', 'Glúteo', 'Controla el movimiento, evita impulsos.'),
('Dominadas (asistidas)', 'Assisted Pull-ups', 'Pull Vertical', 'Machine', 'Dorsal', 'Pecho al cielo, codos hacia abajo.'),
('Remo con barra/mancuerna', 'Bent Over Row', 'Pull Horizontal', 'Barbell', 'Dorsal', 'Codos a la cadera, espalda neutra.'),
('Jalón al pecho', 'Lat Pulldown', 'Pull Vertical', 'Cable', 'Dorsal', 'Lleva la barra a la parte superior del pecho.'),
('Face pulls', 'Face Pulls', 'Pull Horizontal', 'Cable', 'Deltoides Posterior', 'Tira hacia la frente, codos altos.'),
('Plancha c/ toques', 'Plank Shoulder Taps', 'Core', 'Bodyweight', 'Core', 'Evita rotar la cadera al tocar el hombro.'),
('Pallof press', 'Pallof Press', 'Rotation', 'Cable', 'Core', 'Resiste la rotación, mantén el core firme.'),
('Dead bug con peso', 'Weighted Dead Bug', 'Core', 'Dumbbell', 'Core', 'Mantén la lumbar pegada al suelo.'),
('Superman hold', 'Superman Hold', 'Core', 'Bodyweight', 'Core', 'Levanta pecho y piernas, mira abajo.'),
('Hip thrust moderado', 'Moderate Hip Thrust', 'Hinge', 'Barbell', 'Glúteo', 'Controla la fase de bajada.'),
('Step-ups con peso', 'Weighted Step-ups', 'Lunge', 'Dumbbell', 'Cuádriceps', 'Empuja con la pierna de arriba, no te impulses.'),
('Hip extension', 'Back Extension', 'Hinge', 'Machine', 'Glúteo', 'Usa las caderas, no la lumbar.'),
('Kettlebell swings', 'Kettlebell Swings', 'Hinge', 'Kettlebell', 'Glúteo', 'El impulso viene de la cadera, no de los brazos.'),
('Kickback (Polea/Máq)', 'Cable Kickbacks', 'Hinge', 'Cable', 'Glúteo', 'Patada controlada, aprieta el glúteo.'),
('Plancha lateral elevando pierna', 'Side Plank Leg Raise', 'Core', 'Bodyweight', 'Core', 'Mantén la cadera alta.'),
('Elevaciones de piernas', 'Leg Raises', 'Core', 'Bodyweight', 'Core', 'Baja lento, controla con el abdomen.'),
('Russian twist', 'Russian Twist', 'Rotation', 'Bodyweight', 'Core', 'Gira el tronco, sigue con la mirada.'),

-- Marcelo's Plan
('Press de Banca Plano', 'Flat Bench Press', 'Push Horizontal', 'Barbell', 'Pectoral', 'Carga pesada. Descanso: 120-180s.'),
('Remo con Barra (45º)', 'Barbell Row 45deg', 'Pull Horizontal', 'Barbell', 'Dorsal', 'Codos a la cadera, carga pesada.'),
('Press Inclinado (Manc)', 'Incline DB Press', 'Push Horizontal', 'Dumbbell', 'Pectoral', 'Prioriza pecho superior.'),
('Extensión Tríceps Overhead', 'Overhead Tricep Extension', 'Isolation', 'Cable', 'Tríceps', 'Estira la cabeza larga al máximo.'),
('Curl Bíceps Inclinado', 'Incline Bicep Curl', 'Isolation', 'Dumbbell', 'Bíceps', 'Máxima tensión en estiramiento.'),
('Sentadilla con Barra', 'Back Squat', 'Squat', 'Barbell', 'Cuádriceps', 'Carga pesada. Baja lo más profundo posible.'),
('Zancadas Búlgaras', 'Bulgarian Split Squat', 'Lunge', 'Dumbbell', 'Glúteo', 'Torso inclinado adelante para glúteo.'),
('Weight Pullups', 'Weighted Pull-ups', 'Pull Vertical', 'Bodyweight', 'Dorsal', 'Mejor compuesto para espalda ancha.'),
('Elevaciones Laterales', 'Lateral Raises', 'Isolation', 'Dumbbell', 'Deltoides', 'Poco peso, tensión constante.'),
('Face Pull con cuerda', 'Rope Face Pulls', 'Pull Horizontal', 'Cable', 'Deltoides Posterior', 'Corrige hombros redondeados.'),
('Prensa Inclinada', 'Incline Leg Press', 'Squat', 'Machine', 'Cuádriceps', 'Carga moderada. Baja profundo.'),
('Curl Femoral Sentado', 'Seated Leg Curl', 'Isolation', 'Machine', 'Isquios', 'Énfasis en el estiramiento.'),
('Extensión Cuádriceps', 'Leg Extension', 'Isolation', 'Machine', 'Cuádriceps', 'Énfasis en aguantar fase baja.'),
('Plancha Pesada', 'Weighted Plank', 'Core', 'Bodyweight', 'Core', 'Añade disco en la espalda.');
