# README – Stack Tecnológico y Evaluación para Pruebas de Regresión

Documento complementario para evaluar si la aplicación **Bus Control App** (sistema de gestión y monitoreo de líneas de buses en tiempo real) es apta como caso de estudio para una prueba de **Regression Testing**, siguiendo el índice marco proporcionado.

---

## 1. Información general del proyecto

| Campo | Detalle |
|-------|---------|
| **Nombre del proyecto** | Bus Control App – Sistema de Gestión y Monitoreo de Líneas de Buses |
| **Ubicación / Año** | Perú – 2026 |
| **Rol principal** | Full Stack Developer (Frontend + Backend serverless + Base de datos) |
| **Tipo de aplicación** | SPA web (Single Page Application) multirol con backend BaaS |
| **Usuarios objetivo** | Super Admin, Gerentes de empresas de transporte, Administradores, Conductores, Cobradores y Pasajeros (público general) |
| **Dominio** | Transporte público urbano (rutas, paraderos, vehículos, conductores, pagos de membresías y seguimiento GPS simulado en tiempo real) |

### Descripción breve
Bus Control App es una plataforma web multirol que permite a empresas de transporte gestionar sus **líneas de buses, rutas geográficas, paraderos, conductores, cobradores y vehículos**, mientras que los pasajeros pueden **consultar rutas y ver buses circulando en tiempo real** sobre un mapa interactivo (Leaflet + OpenStreetMap/Esri). Incluye módulo de **Super Admin** para validación de pagos y membresías de empresas, módulo de **conductor** con justificación de desvíos y módulo público con geolocalización.

---

## 2. Stack tecnológico detallado

### 2.1 Frontend
| Categoría | Tecnología | Versión | Uso en el proyecto |
|-----------|-----------|---------|--------------------|
| Lenguaje | **TypeScript** | 5.5 | Tipado estático en toda la app |
| Framework UI | **React** | 18.3 | Librería principal de componentes |
| Build tool | **Vite** | 5.4 | Bundler y dev server |
| Compilador React | **@vitejs/plugin-react-swc** | 3.5 | SWC para fast refresh |
| Router | **react-router-dom** | 6.26 | Rutas por rol (`/admin`, `/empresa`, `/conductor`, `/superadmin`, `/public`) |
| Estado server | **@tanstack/react-query** | 5.56 | Cache y sincronización con Supabase |
| Formularios | **react-hook-form** + **@hookform/resolvers** | 7.53 | Manejo de formularios |
| Validación | **Zod** | 3.23 | Esquemas de validación (ej. `useVehiculos`) |

### 2.2 Estilos y UI
| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| CSS framework | **Tailwind CSS** | 3.4 |
| Sistema de componentes | **shadcn/ui** (Radix UI primitives) | última |
| Componentes Radix | Accordion, Dialog, Dropdown, Select, Tabs, Toast, Tooltip, etc. | 1.x / 2.x |
| Iconos | **lucide-react** | 0.462 |
| Animaciones | **tailwindcss-animate** | 1.0 |
| Tema oscuro | **next-themes** | 0.3 |
| Notificaciones | **sonner** + Radix Toast | 1.5 |
| Gráficos | **recharts** | 2.12 |

### 2.3 Mapas y geolocalización
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **Leaflet** | 1.9 | Renderizado principal del mapa público |
| **@types/leaflet** | 1.9 | Tipados |
| **mapbox-gl** | 3.15 | Vistas alternas (componente `MapboxMap.tsx`) |
| Tiles | OpenStreetMap, Esri World Imagery, OpenTopoMap, CARTO | Capas estándar/satélite/relieve/nocturno/claro |

### 2.4 Backend / Base de datos
| Categoría | Tecnología | Detalle |
|-----------|-----------|---------|
| BaaS | **Supabase Cloud** | PostgreSQL gestionado |
| Cliente | **@supabase/supabase-js** 2.57 | Auth + Data API + Realtime |
| Base de datos | **PostgreSQL** | Tablas: `usuarios`, `empresas`, `rutas`, `rutas_geometria`, `paraderos`, `vehiculos`, `conductores`, `lineas_buses`, `pagos`, `membresias`, `configuraciones`, `audit_logs`, `desvios`, `roles`, `user_roles` |
| Funciones SQL | RPC `get_usuario_email_by_codigo`, `get_conductor_email_by_placa`, `has_role` (SECURITY DEFINER) |
| Edge Functions (Deno) | `get-mapbox-token`, `reset-superadmin-password`, `setup-admin` |
| Geometría | WKB nativo en `rutas_geometria` (conversión GeoJSON/WKT en frontend) |
| Autenticación | Supabase Auth (email/password) con flujos diferenciados por rol |

### 2.5 Herramientas de desarrollo
| Tecnología | Versión |
|-----------|---------|
| ESLint | 9.9 |
| typescript-eslint | 8.0 |
| PostCSS + Autoprefixer | 8.4 / 10.4 |
| Bun / npm | gestor de paquetes |

### 2.6 Despliegue
- **Vercel** (build y hosting estático del SPA)
- **Supabase Cloud** (BD, Auth, Edge Functions)
- URL publicada: `https://bus-control-app.vercel.app`

---

## 3. Evaluación frente al índice de Regression Testing

Para cada sección del índice marco se evalúa si la app **es adecuada / cumple** como caso de estudio.

### 3.1 Definición y Alcance del Tema
| Subtema | ¿Aplicable? | Justificación |
|---------|-------------|---------------|
| 3.1.1 Introducción al Software Testing | ✅ | App real con múltiples módulos |
| 3.1.2 Ubicación de pruebas de regresión | ✅ | Permite ilustrar dónde encajan |
| 3.1.3 Definición de Regression Testing | ✅ | Conceptual, aplica |
| 3.1.4 Propósito en SDLC | ✅ | App en evolución activa (cambios recientes en mapa, vehículos, auth) |
| 3.1.5 Tipos (Correctiva, Selectiva, Parcial, Completa, Progresiva) | ✅ Excelente | Hay bugs recientemente corregidos (mapa en blanco, parpadeo, iconos de combi) → ideal para **regresión correctiva y progresiva** |
| 3.1.6 Defectos y vulnerabilidades | ✅ | RLS desactivado en BD, auth multirol → vulnerabilidades reales |
| 3.1.7 Beneficios y limitaciones | ✅ | Aplica |
| 3.1.8 Caso práctico introductorio | ✅ | Ej: validar que tras cambiar el icono del bus, el mapa, la auth y la consulta pública siguen funcionando |

### 3.2 Base Normativa y Estándares
| Norma | ¿Se puede evaluar? | Comentario |
|-------|---------------------|------------|
| ISO/IEC 25010 (calidad) | ✅ | Medible: usabilidad, fiabilidad, seguridad (¡RLS!), mantenibilidad |
| ISO/IEC/IEEE 29119 | ✅ | Aplicable como marco documental |
| ISO/IEC 12207 (ciclo de vida) | ✅ | App con historial de iteraciones |
| ISTQB | ✅ | Terminología aplicable |
| Shift-Left Testing | ⚠️ Parcial | No hay tests unitarios actualmente |
| Agile / DevOps / Continuous Testing / Test Pyramid / Risk-Based | ✅ | Aplicables conceptualmente |

### 3.3 Metodología de Ejecución
| Subtema | Estado en la app |
|---------|------------------|
| 3.3.1 Flujo general | ✅ Aplicable |
| 3.3.2 Momento de ejecución en SDLC | ✅ |
| 3.3.3 Roles (Dev, QA, DevOps, PO, SM) | ✅ Simulable |
| 3.3.4 Diseño de casos de prueba | ✅ Muchos flujos: login por rol, CRUD vehículos, asignación de buses a líneas, pagos, mapa en tiempo real |
| 3.3.5 Preparación de entorno | ✅ Vite dev server + Supabase staging |
| 3.3.6 Ejecución paso a paso | ✅ |
| 3.3.7 Gestión de resultados | ⚠️ No hay reportes automatizados aún |
| 3.3.8 Gestión de defectos | ✅ Historial de bugs en chat |
| 3.3.9 Buenas prácticas | ✅ |
| 3.3.10 Caso práctico | ✅ Ej: regresión sobre módulo de Mapa tras cambio de Mapbox→Leaflet |

### 3.4 Ecosistema de Herramientas por Lenguaje
La app es **TypeScript/JavaScript puro** (frontend React + Edge Functions Deno). Por lo tanto:

| Herramienta | ¿Aplicable a esta app? |
|-------------|------------------------|
| **Jest** | ✅ Compatible con React/TS |
| **Mocha** | ✅ Alternativa |
| **Vitest** | ✅ (recomendado por usar Vite, no listado en índice pero equivalente a Jest) |
| **Cypress** | ✅✅ Ideal para E2E (login multirol, mapa, formularios) |
| **Playwright** | ✅✅ Ideal para E2E multi-navegador y pruebas visuales del mapa |
| PyTest / unittest / Locust | ❌ No aplica (no hay Python) – salvo Locust para load testing del endpoint Supabase |
| PHPUnit / Pest | ❌ No aplica |
| JUnit / TestNG / Selenium | ❌ No aplica (Selenium podría usarse pero Playwright/Cypress son superiores aquí) |
| NUnit / xUnit / MSTest | ❌ No aplica |

> **Conclusión 3.4:** La app cubre perfectamente las secciones de **JavaScript/TypeScript** del índice (Jest, Mocha, Cypress, Playwright). El resto de lenguajes se cubrirían solo de forma teórica/comparativa.

### 3.5 Estrategia de Automatización
| Subtema | Estado actual | Viabilidad |
|---------|---------------|------------|
| 3.5.1 Introducción a automatización | – | ✅ Aplicable |
| 3.5.2 CI | ❌ No configurado | ✅ Fácil con GitHub Actions |
| 3.5.3 CD | ✅ (Vercel auto-deploy) | ✅ |
| 3.5.4 Pipelines | ❌ | ✅ Diseñable |
| 3.5.5 GitHub Actions / GitLab CI / Jenkins | ❌ | ✅ GitHub Actions recomendado |
| 3.5.6 Reportes automáticos | ❌ | ✅ HTML reporters de Playwright/Vitest |
| 3.5.7 Gestión de fallos | ❌ | ✅ |
| 3.5.8 Métricas | ❌ | ✅ Coverage con `c8`/Vitest |
| 3.5.9 Caso práctico | – | ✅ Pipeline: lint → typecheck → unit (Vitest) → E2E (Playwright) → deploy |

---

## 4. Veredicto: ¿Cumple la app para Regression Testing?

### ✅ SÍ CUMPLE – Recomendada como caso de estudio

**Fortalezas:**
1. **App real, multirol y multifuncional** → permite diseñar suites de regresión amplias (auth, CRUD, mapa, pagos, geolocalización).
2. **Stack JS/TS moderno** → encaja directamente con las herramientas del índice (Jest, Mocha, Cypress, Playwright, GitHub Actions).
3. **Historial documentado de cambios y bugs** (mapa Mapbox → Leaflet, parpadeo, iconos, auth) → ejemplos reales de **regresión correctiva y progresiva**.
4. **Backend Supabase con RLS, RPCs y Edge Functions** → permite pruebas de integración y de seguridad.
5. **Componentes shadcn/ui estables** → buena base para snapshot testing.
6. **Build reproducible con Vite** → fácil CI/CD.

**Brechas (oportunidades de mejora documentables como recomendaciones):**
- ❌ No existen aún **tests unitarios ni E2E** en el repositorio (scripts `test` ausentes en `package.json`).
- ❌ No hay **pipeline CI/CD propio** (depende del deploy de Vercel).
- ❌ No hay **reportes de cobertura ni métricas** de calidad.
- ⚠️ **RLS desactivado** en BD → riesgo de seguridad que debe entrar en el plan de regresión.

### Recomendación de herramientas concretas para implementar la prueba
| Capa | Herramienta sugerida |
|------|----------------------|
| Unit / Integration | **Vitest** (alineado con Vite) o Jest |
| Componentes React | **@testing-library/react** |
| E2E | **Playwright** (multi-navegador, soporta mapas y geolocalización mockeada) |
| Visual regression | **Playwright screenshots** o Percy |
| Carga | **k6** o **Locust** contra Supabase |
| CI/CD | **GitHub Actions** |
| Reportes | Playwright HTML Reporter + Vitest Coverage (c8) |

---

## 5. Resumen ejecutivo (para tu informe)

> La aplicación **Bus Control App**, construida con **React 18 + TypeScript + Vite + Tailwind/shadcn + Leaflet** en el frontend y **Supabase (PostgreSQL + Auth + Edge Functions Deno)** en el backend, constituye un caso de estudio **adecuado y representativo** para aplicar **Pruebas de Regresión** según el marco propuesto. Cubre de forma natural las secciones del índice referidas al ecosistema **JavaScript/TypeScript** (Jest, Mocha, Cypress, Playwright) y permite ejemplificar **regresión correctiva, selectiva, parcial, completa y progresiva** a partir de los cambios reales realizados sobre el módulo de mapas, autenticación multirol y gestión de vehículos. Las secciones del índice referidas a otros lenguajes (Python, PHP, Java, C#) solo aplicarían de forma **comparativa/teórica**.

Listo, evaluación guardada en `README_REGRESSION_TESTING.md`.
