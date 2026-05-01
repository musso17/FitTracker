// Base de datos nutricional local — extraída del informe "Alimentación"
// Fuente: Nutrición Deportiva Clínica para Surf + Muay Thai + Recomposición Corporal

export interface FoodItem {
    id: string;
    name: string;
    emoji: string;
    category: 'protein' | 'carb_complex' | 'carb_fast' | 'fat' | 'superfood' | 'hydration' | 'snack';
    timing: ('pre' | 'post' | 'any' | 'morning' | 'night')[];
    tags: string[]; // surf, muay_thai, recovery, mass, performance, fat_loss
    benefit: string;
    portion?: string;
    snackable?: boolean; // true = puede aparecer en el slot de snack (grab-and-go)
}

export const FOOD_DATABASE: FoodItem[] = [
    // ==================== PROTEÍNAS ====================
    {
        id: 'chicken_breast',
        name: 'Pechuga de Pollo',
        emoji: '🍗',
        category: 'protein',
        timing: ['any'],
        tags: ['mass', 'performance', 'fat_loss', 'surf', 'muay_thai'],
        benefit: 'Proteína magra de alta biodisponibilidad. Base del pacing proteico.',
        portion: '150-200g'
    },
    {
        id: 'bonito_fish',
        name: 'Pescado Bonito',
        emoji: '🐟',
        category: 'protein',
        timing: ['any', 'night'],
        tags: ['surf', 'recovery', 'fat_loss', 'mass'],
        benefit: 'Rico en Omega-3. Resolución natural de inflamación miocítica (IL-6).',
        portion: '150g'
    },
    {
        id: 'jurel_fish',
        name: 'Jurel (lata o fresco)',
        emoji: '🐠',
        category: 'protein',
        timing: ['any'],
        tags: ['surf', 'recovery', 'fat_loss', 'performance'],
        benefit: 'Omega-3 del Pacífico. Antiinflamatorio económico y accesible.',
        portion: '1 lata / 150g'
    },
    {
        id: 'eggs',
        name: 'Huevos enteros',
        emoji: '🥚',
        category: 'protein',
        timing: ['morning', 'any'],
        tags: ['mass', 'performance', 'muay_thai', 'surf'],
        benefit: 'Proteína completa + colina para SNC. Colesterol para síntesis hormonal.',
        portion: '3-4 unidades'
    },
    {
        id: 'greek_yogurt',
        name: 'Yogur Griego natural',
        emoji: '🥛',
        category: 'protein',
        timing: ['any', 'night'],
        tags: ['mass', 'recovery', 'surf', 'muay_thai'],
        benefit: 'Caseína de digestión lenta. Sostiene aminoacidemia nocturna.',
        portion: '200g',
        snackable: true
    },
    {
        id: 'whey_protein',
        name: 'Whey Protein Isolate',
        emoji: '🥤',
        category: 'protein',
        timing: ['post'],
        tags: ['mass', 'performance', 'muay_thai', 'surf'],
        benefit: 'Asimilación rápida post-entreno. Activa mTORC1 inmediatamente.',
        portion: '30g (1 scoop)',
        snackable: true
    },
    {
        id: 'lean_beef',
        name: 'Carne magra (lomo)',
        emoji: '🥩',
        category: 'protein',
        timing: ['any', 'night'],
        tags: ['mass', 'muay_thai', 'performance'],
        benefit: 'Hierro hemo + creatina natural. Reparación de microlesiones fibrilares.',
        portion: '150g'
    },

    // ==================== CARBOHIDRATOS COMPLEJOS ====================
    {
        id: 'oatmeal',
        name: 'Avena',
        emoji: '🥣',
        category: 'carb_complex',
        timing: ['morning', 'pre'],
        tags: ['surf', 'muay_thai', 'mass', 'performance'],
        benefit: 'Liberación lenta. Estabilidad glucémica para sesiones largas.',
        portion: '80-100g'
    },
    {
        id: 'kiwicha',
        name: 'Kiwicha (Amaranto)',
        emoji: '🌾',
        category: 'carb_complex',
        timing: ['morning', 'pre'],
        tags: ['surf', 'performance', 'mass'],
        benefit: 'Pseudocereal andino con perfil de aminoácidos completo. Precursores de óxido nítrico.',
        portion: '60-80g'
    },
    {
        id: 'quinoa',
        name: 'Quinoa',
        emoji: '🌿',
        category: 'carb_complex',
        timing: ['any', 'pre'],
        tags: ['surf', 'muay_thai', 'mass', 'fat_loss'],
        benefit: 'Proteína vegetal completa + fibra. Índice glucémico moderado.',
        portion: '80g (cruda)'
    },
    {
        id: 'sweet_potato',
        name: 'Camote morado',
        emoji: '🍠',
        category: 'carb_complex',
        timing: ['any', 'post'],
        tags: ['surf', 'muay_thai', 'mass', 'performance'],
        benefit: 'Antocianinas antioxidantes + carga glucogénica limpia.',
        portion: '200g'
    },
    {
        id: 'brown_rice',
        name: 'Arroz integral',
        emoji: '🍚',
        category: 'carb_complex',
        timing: ['any'],
        tags: ['mass', 'performance', 'muay_thai'],
        benefit: 'Base calórica estable. Fibra para saciedad prolongada.',
        portion: '100g (crudo)'
    },

    // ==================== CARBOHIDRATOS RÁPIDOS (Post-entreno) ====================
    {
        id: 'banana',
        name: 'Plátano maduro',
        emoji: '🍌',
        category: 'carb_fast',
        timing: ['post', 'pre'],
        tags: ['surf', 'muay_thai', 'performance', 'mass'],
        benefit: 'Glucógeno rápido + potasio. Ventana anabólica 30-60min post-entreno.',
        portion: '1-2 unidades',
        snackable: true
    },
    {
        id: 'white_rice',
        name: 'Arroz blanco',
        emoji: '🍙',
        category: 'carb_fast',
        timing: ['post'],
        tags: ['mass', 'performance', 'muay_thai'],
        benefit: 'Alto índice glucémico. Maximiza actividad de glucógeno sintasa.',
        portion: '150g (cocido)'
    },
    {
        id: 'dates',
        name: 'Dátiles',
        emoji: '🫘',
        category: 'carb_fast',
        timing: ['pre', 'post'],
        tags: ['surf', 'performance', 'muay_thai'],
        benefit: 'Energía concentrada sin procesamiento. Ideal pre-sesión de surf.',
        portion: '3-4 unidades',
        snackable: true
    },

    // ==================== GRASAS FUNCIONALES ====================
    {
        id: 'sacha_inchi_oil',
        name: 'Aceite de Sacha Inchi',
        emoji: '🫒',
        category: 'fat',
        timing: ['any', 'night'],
        tags: ['surf', 'muay_thai', 'recovery', 'fat_loss'],
        benefit: '45-57% Omega-3. Reduce IL-6 y PCR. Antiinflamatorio post-patadas.',
        portion: '15ml (1 cda)'
    },
    {
        id: 'avocado',
        name: 'Palta (Aguacate)',
        emoji: '🥑',
        category: 'fat',
        timing: ['any', 'morning'],
        tags: ['mass', 'performance', 'surf', 'fat_loss'],
        benefit: 'Grasas monoinsaturadas + potasio. Sostiene testosterona libre.',
        portion: '½ unidad'
    },
    {
        id: 'mixed_nuts',
        name: 'Mix de frutos secos',
        emoji: '🥜',
        category: 'fat',
        timing: ['any'],
        tags: ['mass', 'performance', 'fat_loss'],
        benefit: 'Energía densa + micronutrientes. Snack anti-cortisol entre comidas.',
        portion: '30g',
        snackable: true
    },
    {
        id: 'sacha_inchi_seeds',
        name: 'Semillas de Sacha Inchi',
        emoji: '🌰',
        category: 'fat',
        timing: ['any'],
        tags: ['surf', 'recovery', 'fat_loss', 'muay_thai'],
        benefit: 'Snack Omega-3 portátil. Perfecto entre sesiones dobles.',
        portion: '20-30g',
        snackable: true
    },

    // ==================== SUPERALIMENTOS PERUANOS ====================
    {
        id: 'maca_negra',
        name: 'Maca Negra (polvo)',
        emoji: '⚡',
        category: 'superfood',
        timing: ['morning', 'pre'],
        tags: ['muay_thai', 'performance', 'surf'],
        benefit: 'Buffer de ácido láctico. Mejora resistencia y agilidad. Reduce IL-6 y TNF-α.',
        portion: '2.5g/día'
    },
    {
        id: 'camu_camu',
        name: 'Camu Camu (polvo)',
        emoji: '🍊',
        category: 'superfood',
        timing: ['post', 'morning'],
        tags: ['surf', 'muay_thai', 'recovery'],
        benefit: '6500mg Vit C/100g. Escudo antioxidante contra ROS post-entreno.',
        portion: '5-10g'
    },
    {
        id: 'yacon_syrup',
        name: 'Jarabe de Yacón',
        emoji: '🍯',
        category: 'superfood',
        timing: ['any', 'morning'],
        tags: ['fat_loss', 'recovery'],
        benefit: 'Prebiótico (FOS). Estimula GLP-1. Reduce grasa visceral sin hipoglucemia.',
        portion: '10-15ml'
    },
    {
        id: 'canihua',
        name: 'Cañihua',
        emoji: '🌱',
        category: 'superfood',
        timing: ['morning', 'pre'],
        tags: ['surf', 'performance', 'mass'],
        benefit: 'Grano andino con hierro + zinc. Combate fatiga del SNC en sesiones largas.',
        portion: '40-60g'
    },

    // ==================== HIDRATACIÓN ====================
    {
        id: 'water',
        name: 'Agua',
        emoji: '💧',
        category: 'hydration',
        timing: ['any', 'pre', 'post'],
        tags: ['surf', 'muay_thai', 'recovery', 'mass', 'performance', 'fat_loss'],
        benefit: '5-10ml/kg pre-entreno. 1.25L por cada kg perdido post-sesión.',
        portion: '500-800ml/hora'
    },
    {
        id: 'coconut_water',
        name: 'Agua de coco',
        emoji: '🥥',
        category: 'hydration',
        timing: ['post'],
        tags: ['surf', 'recovery', 'performance'],
        benefit: 'Electrolitos naturales. Rehidratación post-surf sin azúcares añadidos.',
        portion: '330ml'
    },

    // ==================== SNACKS PRÁCTICOS ====================
    {
        id: 'apple',
        name: 'Manzana',
        emoji: '🍎',
        category: 'snack',
        timing: ['any'],
        tags: ['fat_loss', 'recovery', 'surf', 'muay_thai'],
        benefit: 'Fibra + fructosa de baja carga. Saciedad rápida sin picos de insulina.',
        portion: '1 unidad',
        snackable: true
    },
    {
        id: 'dark_chocolate',
        name: 'Chocolate oscuro 70%+',
        emoji: '🍫',
        category: 'snack',
        timing: ['any'],
        tags: ['recovery', 'performance', 'fat_loss'],
        benefit: 'Flavonoides + magnesio. Activa flujo sanguíneo y reduce cortisol.',
        portion: '20-30g (2-3 cuadros)',
        snackable: true
    },
    {
        id: 'protein_bar',
        name: 'Barra de proteína',
        emoji: '🟫',
        category: 'snack',
        timing: ['any'],
        tags: ['mass', 'performance', 'muay_thai', 'surf'],
        benefit: 'Proteína portátil. Ideal entre sesiones cuando no hay tiempo de cocinar.',
        portion: '1 barra (20-30g prot)',
        snackable: true
    },
    {
        id: 'boiled_eggs_snack',
        name: 'Huevos duros',
        emoji: '🥚',
        category: 'snack',
        timing: ['any'],
        tags: ['mass', 'fat_loss', 'muay_thai', 'surf'],
        benefit: 'Proteína completa lista para llevar. Preparar la noche anterior.',
        portion: '2 unidades',
        snackable: true
    },
];

// ==================== MEAL TEMPLATES POR TIPO DE DÍA ====================

export interface MealSlot {
    id: string;
    label: string;
    emoji: string;
    time: string;
    description: string;
}

export const MEAL_SLOTS: MealSlot[] = [
    { id: 'pre', label: 'Pre-Entreno', emoji: '🌅', time: '6:00 - 8:00', description: 'Combustible para la sesión' },
    { id: 'post', label: 'Post-Entreno', emoji: '💪', time: '10:00 - 12:00', description: 'Ventana de recuperación' },
    { id: 'snack', label: 'Snack', emoji: '🥤', time: '15:00 - 16:00', description: 'Recarga metabólica' },
    { id: 'dinner', label: 'Cena', emoji: '🌙', time: '19:00 - 21:00', description: 'Reparación nocturna' },
];

export type DayType = 'double' | 'gym' | 'surf' | 'muay_thai' | 'rest';

export interface DayProfile {
    type: DayType;
    label: string;
    emoji: string;
    carbLevel: 'high' | 'moderate' | 'low';
    proteinPriority: 'max' | 'high' | 'standard';
    superfoods: string[]; // IDs from FOOD_DATABASE
}

export const DAY_PROFILES: Record<DayType, DayProfile> = {
    double: {
        type: 'double',
        label: 'Entrenamiento Doble',
        emoji: '🔥🔥',
        carbLevel: 'high',
        proteinPriority: 'max',
        superfoods: ['maca_negra', 'camu_camu'],
    },
    gym: {
        type: 'gym',
        label: 'Día de Fuerza',
        emoji: '🏋️',
        carbLevel: 'moderate',
        proteinPriority: 'high',
        superfoods: ['maca_negra'],
    },
    surf: {
        type: 'surf',
        label: 'Día de Surf',
        emoji: '🏄',
        carbLevel: 'high',
        proteinPriority: 'high',
        superfoods: ['camu_camu', 'canihua'],
    },
    muay_thai: {
        type: 'muay_thai',
        label: 'Día de Muay Thai',
        emoji: '🥊',
        carbLevel: 'high',
        proteinPriority: 'max',
        superfoods: ['maca_negra', 'camu_camu'],
    },
    rest: {
        type: 'rest',
        label: 'Recuperación',
        emoji: '🧘',
        carbLevel: 'low',
        proteinPriority: 'standard',
        superfoods: ['yacon_syrup'],
    },
};

// Reglas de selección de alimentos por slot y tipo de día
export interface MealRule {
    slotId: string;
    dayTypes: DayType[];
    categories: FoodItem['category'][];
    preferTags?: string[];
    excludeTags?: string[];
    count: number; // cuántos alimentos recomendar en este slot
    snackableOnly?: boolean; // true = solo alimentos con snackable: true
}

export const MEAL_RULES: MealRule[] = [
    // PRE-ENTRENO
    { slotId: 'pre', dayTypes: ['double', 'surf'], categories: ['carb_complex', 'hydration'], preferTags: ['surf'], count: 3 },
    { slotId: 'pre', dayTypes: ['muay_thai'], categories: ['carb_complex', 'carb_fast'], preferTags: ['muay_thai'], count: 3 },
    { slotId: 'pre', dayTypes: ['gym'], categories: ['carb_complex', 'protein'], preferTags: ['mass', 'performance'], count: 3 },
    { slotId: 'pre', dayTypes: ['rest'], categories: ['protein', 'fat'], preferTags: ['fat_loss', 'recovery'], count: 2 },

    // POST-ENTRENO
    { slotId: 'post', dayTypes: ['double', 'surf', 'muay_thai'], categories: ['carb_fast', 'protein', 'hydration'], preferTags: ['recovery'], count: 3 },
    { slotId: 'post', dayTypes: ['gym'], categories: ['protein', 'carb_fast'], preferTags: ['mass'], count: 3 },
    { slotId: 'post', dayTypes: ['rest'], categories: ['protein', 'fat', 'superfood'], preferTags: ['recovery'], count: 2 },

    // SNACK — Solo items grab-and-go (snackable: true)
    { slotId: 'snack', dayTypes: ['double', 'surf', 'muay_thai', 'gym'], categories: ['snack', 'fat', 'protein', 'carb_fast'], snackableOnly: true, count: 2 },
    { slotId: 'snack', dayTypes: ['rest'], categories: ['snack', 'fat', 'superfood'], snackableOnly: true, preferTags: ['fat_loss'], count: 2 },

    // CENA
    { slotId: 'dinner', dayTypes: ['double', 'muay_thai'], categories: ['protein', 'fat', 'carb_complex'], preferTags: ['recovery'], count: 3 },
    { slotId: 'dinner', dayTypes: ['surf', 'gym'], categories: ['protein', 'fat'], preferTags: ['recovery', 'mass'], count: 3 },
    { slotId: 'dinner', dayTypes: ['rest'], categories: ['protein', 'fat'], preferTags: ['fat_loss', 'recovery'], count: 2 },
];
