---
name: fitgo-frontend-design
description: "Guía de diseño visual y stack de UI para el frontend de FIT GO (React + Tailwind + shadcn/ui + Lucide + Framer Motion). Úsala junto al skill funcional (fitgo-frontend) al pedirle a otra IA que construya la interfaz — define paleta de colores, tipografía, estilo de componentes, layout, animaciones y notas de despliegue en Vercel para que el resultado se vea pulido y consistente en todo el sistema."
---

# FIT GO — Guía de Diseño para el Frontend

Este documento complementa al skill funcional (`fitgo-frontend-skill`), que define QUÉ hace cada pantalla y a qué endpoint se conecta. Este documento define CÓMO debe verse: colores, tipografía, componentes, layout y animaciones. Úsalos juntos.

## 0- Rol : Arquitecto de software senior en frontend.

## 1. Stack de UI

- **React** (Vite como bundler — SPA, sin necesidad de SSR para un panel administrativo interno).
- **Tailwind CSS** para utilidades de estilo.
- **shadcn/ui** para componentes base (botones, inputs, modales, tablas, dropdowns, tarjetas). No es una librería tradicional: los componentes se generan/copian dentro del proyecto y se personalizan con Tailwind — úsalos como punto de partida para todo formulario, modal o tabla en vez de construir desde cero.
- **Lucide React** para íconos (estilo outline, consistente en todo el sistema).
- **Framer Motion** para animaciones, con uso moderado: transiciones de página, aparición de tarjetas del dashboard, y el feedback visual del check-in. Evitar animaciones largas o excesivas — deben sentirse rápidas y funcionales, no decorativas.
- **Recharts** (opcional, si se agregan gráficos al dashboard más adelante).

## 2. Identidad de marca

- **Nombre del sistema**: FIT GO.
- **Tono visual**: moderno, limpio, energético — pensado para un panel administrativo usado a diario por recepción y administración, no una landing de marketing. Prioriza la claridad y velocidad de lectura sobre la decoración.
- **Tipografía**: **Inter** para todo el sistema (textos, tablas, formularios). Es limpia, muy legible en tablas de datos y tiene excelente soporte en Google Fonts.
  - Títulos de sección: `font-semibold`, tamaño `text-xl` a `text-2xl`.
  - Texto de tablas/formularios: `font-normal`, `text-sm` a `text-base`.
  - KPIs del dashboard: `font-bold`, tamaño grande (`text-3xl` o más).

## 3. Paleta de colores

Colores base (usar como variables de Tailwind/CSS, no hardcodeados en cada componente):

| Uso | Color sugerido | Ejemplo Tailwind |
|---|---|---|
| Primario (marca, botones principales, links activos) | Azul energético | `blue-600` / `blue-700` (hover) |
| Fondo general | Gris muy claro | `slate-50` |
| Superficies (tarjetas, tablas) | Blanco | `white` con `border-slate-200` |
| Texto principal | Gris oscuro | `slate-900` |
| Texto secundario | Gris medio | `slate-500` |
| Estado **Activo** (socio, membresía vigente) | Verde | `emerald-500` (badge: `bg-emerald-100 text-emerald-700`) |
| Estado **Vencido** | Rojo | `red-500` (badge: `bg-red-100 text-red-700`) |
| Alertas / próximos a vencer (≤7 días) | Ámbar | `amber-500` (badge: `bg-amber-100 text-amber-700`) |
| Acciones destructivas (eliminar) | Rojo | `red-600` |

Mantener estos colores de estado **idénticos** en toda la app: badges, KPIs del dashboard, filas de tabla, pantalla de check-in. La consistencia entre pantallas es más importante que la variedad.

## 4. Componentes base (vía shadcn/ui)

Usar los componentes de shadcn como base para:
- **Button**: variantes `default` (primario, azul), `outline` (acciones secundarias), `destructive` (eliminar), `ghost` (acciones en tablas).
- **Card**: contenedor estándar para KPIs del dashboard, perfil de socio, detalle de clase.
- **Table**: para todos los listados (socios, membresías, clases, usuarios, inscripciones).
- **Dialog** (modal): para formularios de creación/edición rápida sin cambiar de página (ej. "Nueva membresía", "Inscribir socio").
- **Badge**: para estados (`Activo`/`Vencido`) y roles (`Administrador`/`Personal`/`Cliente`).
- **Input / Select / Label**: formularios consistentes en todo el sistema.
- **Toast** (sonner o el toast de shadcn): para mostrar el campo `mensaje` que devuelve el backend en cada respuesta (éxito o error).
- **Skeleton**: mientras cargan datos desde la API, evitar pantallas en blanco.

No mezclar estos componentes con otra librería de UI (ej. Material UI, Bootstrap) — mantener todo bajo shadcn + Tailwind para consistencia visual.

## 5. Layout general

- **Estructura**: sidebar fijo a la izquierda (colapsable en pantallas medianas) + topbar superior con nombre del usuario logueado y su rol (badge).
- **Sidebar**: ítems de navegación con ícono (Lucide) + texto, resaltando el activo con fondo `blue-50` y texto `blue-700`. Los ítems visibles dependen del rol (ver skill funcional, sección 3).
- **Ancho de contenido**: máximo `max-w-7xl`, centrado, con padding lateral (`px-6` o `px-8`) para que las tablas no se sientan pegadas al borde.
- **Espaciado**: usar la escala de Tailwind de forma consistente (`gap-4`, `gap-6` entre tarjetas/secciones) — evitar espaciados arbitrarios.
- **Responsive**:
  - Panel administrativo (dashboard, CRUDs): pensado principalmente para desktop/laptop; que sea usable en tablet pero no es la prioridad.
  - **Pantalla de Check-in**: sí debe ser 100% responsive y optimizada para **tablet en modo vertical u horizontal**, ya que corre físicamente en recepción. Diseño fullscreen, sin sidebar, con el input de DNI y el feedback ocupando la mayor parte de la pantalla, y texto/iconos grandes y legibles a distancia.

## 6. Animaciones (Framer Motion)

Usar con moderación, en estos puntos concretos:
- **Transición de rutas**: fade sutil (150–200ms) al cambiar de página.
- **Tarjetas del dashboard**: aparición escalonada (`stagger`) al cargar, sutil (no más de 300ms de duración total).
- **Check-in**: la respuesta (verde/rojo) debe animarse con un scale/fade rápido (~200ms) para sentirse inmediata, no un fade lento.
- **Modales (Dialog)**: shadcn ya incluye una transición base — no sobreescribirla con animaciones adicionales que la dupliquen.

Evitar: animaciones de más de 400ms, efectos parallax, o cualquier animación en tablas grandes (afecta rendimiento con muchos socios).

## 7. Notas de despliegue (Vercel)

- Usar variables de entorno con prefijo `VITE_` (ej. `VITE_API_URL`) y referenciarlas en el código como `import.meta.env.VITE_API_URL` — nunca hardcodear `http://localhost:3000`.
- El build de Vercel para un proyecto Vite es automático: detecta el comando `npm run build` y sirve la carpeta `dist`.
- El backend deberá desplegarse aparte (Railway, Render, VPS, etc.) y su URL pública es la que va en `VITE_API_URL`.
- En producción, el backend debe restringir `cors()` al dominio exacto del frontend en Vercel, no dejarlo abierto a cualquier origen.

## 8. Cómo usar este documento junto al skill funcional

Al pedirle a la otra IA que genere el frontend, comparte **ambos documentos** (`fitgo-frontend-skill` funcional + este de diseño) en el mismo prompt/contexto. El funcional le dice qué endpoints existen y qué debe hacer cada pantalla; este le dice cómo debe verse. Si solo se comparte uno de los dos, el resultado será funcional pero visualmente genérico, o bonito pero desconectado del backend real.
