# Ana App — Arquitectura y Guía de Contexto

## ¿Qué es?
Una **PWA de fitness** hecha en React + TypeScript, diseñada para dos usuarios (Ana y Marcelo). Funciona como una aplicación instalable en iPhone/Android con soporte para notificaciones push. El backend es **Supabase** (Auth, PostgreSQL, Edge Functions).

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript (Vite) |
| Estilos | TailwindCSS |
| Backend | Supabase (Auth, Database, Edge Functions) |
| PWA | Service Worker (`public/sw.js`) + manifest.json |
| Push Notifications | Web Push API (VAPID, RFC 8291, implementación nativa con Web Crypto en Deno) |
| Despliegue | Netlify (frontend) + Supabase (backend) |

---

## Estructura de Archivos

```
src/
├── App.tsx          ← TODO: lógica, estado, UI (~2800 líneas, monolítico)
├── constants.tsx    ← Iconos (FontAwesome wrappers), helpers, constantes
├── plans.tsx        ← Rutinas de entrenamiento de Ana y Marcelo
├── utils/
│   └── supabase.ts  ← Cliente de Supabase
├── index.css        ← Estilos base
└── App.css          ← Animaciones y estilos adicionales

public/
├── sw.js            ← Service Worker (push, notificationclick)
└── manifest.json    ← Configuración PWA

supabase/functions/
└── daily-motivation/
    └── index.ts     ← Edge Function: notificaciones push (VAPID + Web Crypto nativo)
```

---

## Arquitectura de `App.tsx` (archivo principal)

El archivo es **monolítico** y contiene todo. Estas son las secciones principales por orden aproximado de línea:

### 1. Estado Global (líneas ~13-42)
- `isAuthenticated`, `userSession` — Autenticación Supabase
- `activeTab` — Navegación: `home`, `dashboard`, `profile`, `active_session`, `recap`
- `logs` — Array de sesiones de entrenamiento (sincronizado con Supabase)
- `sessionExercises` — Ejercicios activos durante una sesión en curso
- `profile` — Datos del usuario: `{ height, weight, strength_goals }`
- `notificationSettings` — Config de notificaciones locales
- `restTimer` — Temporizador de descanso entre series

### 2. Lógica Multi-Usuario (líneas ~60-90)
- Detecta quién está logueado (Ana o Marcelo) basándose en el email de Supabase Auth
- Carga el plan correspondiente de `plans.tsx`
- Soporta **override de rutinas** (el usuario puede personalizar sus bloques)

### 3. Dashboard Stats & Analytics (líneas ~90-300)
- `dashboardStats` (useMemo) — Calcula en tiempo real:
  - **strengthMetrics**: progreso de fuerza por ejercicio, PRs, historial de pesos
  - **logros**: sistema de achievements desbloqueables
  - **workoutsThisWeek**: contador de sesiones semanales
  - **totalSurfMins / totalMuayThaiMins**: horas de actividades específicas
  - **tonnage** (tonelaje): volumen total de carga semanal (kg × reps)

### 4. Progresión de Peso Inteligente (líneas ~350-400)
- `baseGoal`: calcula metas de peso basadas en el peso corporal del usuario
- Distingue entre tipos de ejercicio: Isolation, Unilateral, Goblet, Assisted, Barbell
- Usa ratios fisiológicos (ej: squat = 1.2× bodyweight, isolation = 0.2× bodyweight)

### 5. Coach IA / Recomendaciones (líneas ~540-670)
- `coachInsights` (useMemo) — Genera insights inteligentes:
  - Detección de **plateau** (estancamiento en peso)
  - Alertas de **volumen excesivo** (trash volume)
  - Alertas de **desequilibrio** muscular
  - Fallback positivo: "Signos vitales óptimos" cuando todo está bien
- Se muestra como **"Recomendación de tu Coach:"** con icono de actividad

### 6. Manejo de Sesiones (líneas ~670-830)
- `handleStartBlock(block)` — Inicia una sesión:
  - Auto-fill inteligente: copia pesos de la sesión anterior (no interpola)
  - Calcula `baseGoal` para ejercicios nuevos sin historial
- `handleFinishSession()` — Guarda la sesión:
  - Persiste en Supabase (`logs` table)
  - Muestra pantalla de recap con estadísticas

### 7. Notificaciones Push (líneas ~850-970)
- `subscribeToPush()` — Registra el dispositivo con VAPID public key
- `requestNotificationPermission()` — Pide permiso al usuario
- `notify()` — Envía notificación local (con fallback a Service Worker para iOS)
- Timer de hidratación (configurable: 30/60/90 min)
- Notificación diaria con reto de PR

### 8. Streak (Racha) (líneas ~2420-2460)
- Calcula días consecutivos de entrenamiento
- Se muestra en el header del Home
- Alerta visual "¡Racha en Riesgo!" cuando son >18:00 y no han entrenado

### 9. Render Functions (UI)
| Función | Líneas aprox. | Qué renderiza |
|---|---|---|
| `renderHome()` | ~1031-1145 | Pantalla principal: bloque recomendado, plan flexible, alerta de racha |
| `renderActiveSession()` | ~1150-1530 | Sesión activa: ejercicios, series, inputs de peso, PR badges, rest timer |
| `renderDashboard()` | ~1545-1960 | Metas: sesiones semanales, logros, Coach, galería de marcas, drill-down |
| `renderProfile()` | ~2065-2420 | Perfil: notificaciones, lista de bloques, editor de bloques, logout |
| `renderLogin()` | ~2460-2540 | Pantalla de login con Supabase Auth |
| `renderRecap()` | ~1960-2060 | Resumen post-sesión con estadísticas |

---

## Base de Datos (Supabase PostgreSQL)

### Tabla: `profiles`
| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID (FK auth.users) | ID del usuario |
| height | INTEGER | Altura en cm |
| weight | INTEGER | Peso en kg |
| strength_goals | JSONB | Metas de fuerza por ejercicio |
| push_subscription | TEXT | Suscripción Web Push (JSON stringified) |

### Tabla: `logs`
| Columna | Tipo | Descripción |
|---|---|---|
| id | SERIAL | ID auto-incremental |
| date | TEXT | Fecha ISO (YYYY-MM-DD) |
| blockId | TEXT | ID del bloque (ej: `ana_b2`, `mar_b1`) |
| blockTitle | TEXT | Nombre del bloque |
| userId | UUID | ID del usuario |
| exercises | JSONB | Array de ejercicios con series completadas |
| duration | INTEGER | Duración en segundos |
| surfMinutes | INTEGER | Minutos de surf (solo Ana) |
| muayThaiMinutes | INTEGER | Minutos de Muay Thai (solo Marcelo) |

### Tabla: `plan_blocks_override`
| Columna | Tipo | Descripción |
|---|---|---|
| user_key | TEXT | `ana` o `marcelo` |
| blocks | JSONB | Bloques personalizados del usuario |

---

## Edge Function: `daily-motivation`

Implementa el **protocolo Web Push completo** usando Web Crypto nativo de Deno:
- **VAPID JWT** (RFC 8292): Firma ECDSA P-256 para autenticación del servidor
- **Content Encryption** (RFC 8291): ECDH + HKDF + AES-128-GCM
- **Eventos soportados**: 
  - `test_pr` — Envía notificación de prueba a todos los suscriptores
  - Default — Recordatorio diario / alerta de racha

---

## Conceptos Clave del Dominio

- **Bloque**: Una sesión de entrenamiento temática (ej: "Glúteos: Fuerza Segura")
- **PR (Personal Record)**: El peso máximo registrado para un ejercicio
- **Racha (Streak)**: Días consecutivos con al menos una sesión registrada
- **Tonelaje**: Volumen total de carga = Σ(peso × repeticiones) por semana
- **Coach**: Sistema de recomendaciones basado en análisis de datos históricos
- **Logros**: Achievements desbloqueables (ej: "Primera semana completa", "5 PRs")
- **Visual**: Categoría biomecánica del ejercicio (`squat`, `hinge`, `pull`, `push`, `core`)

---

## Flujo de Usuario Típico

```
Login (Supabase Auth)
  → Home: Ve su bloque recomendado (rotación cíclica)
  → Pulsa "Iniciar Bloque"
  → Active Session: Registra peso/reps por serie
    → Ve sugerencias de PR basadas en su historial
    → Usa rest timer entre series
  → Pulsa "Finalizar"
  → Recap: Ve estadísticas de la sesión
  → Dashboard/Metas: Ve logros, progresión, Coach
```

---

## Notas para Desarrollo

1. **App.tsx es monolítico** (~2800 líneas). Todo el estado, lógica y UI está en un solo componente. No hay routing (se usa `activeTab` como pseudo-router).
2. **Los datos se sincronizan con Supabase** pero también se cachean en `localStorage` para offline.
3. **Las rutinas son editables**: el usuario puede modificar, agregar o eliminar bloques desde el Perfil. Los cambios se guardan en `plan_blocks_override`.
4. **El sistema de peso auto-fill** copia los pesos de la última sesión del mismo bloque. No hace incrementos automáticos — la progresión es manual.
5. **iOS requiere** que la app esté añadida a la pantalla de inicio para recibir push notifications (iOS 16.4+).
