---
name: fitgo-frontend
description: "Especificación completa del backend de FIT GO (API REST en Node.js + Express + Sequelize + PostgreSQL) para generar el frontend en React + Tailwind CSS. Úsala como contexto/skill al pedirle a otra IA que construya la interfaz: contiene todos los endpoints, formatos de request/response, reglas de negocio, roles, y las pantallas/componentes sugeridos que deben conectarse a esta API."
---

# FIT GO — Especificación de Backend para generar el Frontend

## 0- Rol : Arquitecto de software senior en frontend.

## 1. Contexto general

FIT GO es un sistema de gestión de gimnasio. El backend ya está construido y funcionando:

- **Stack backend**: Node.js + Express + Sequelize (ORM) + PostgreSQL.
- **Base URL** (producción): `https://proyectobackendgymgofit.onrender.com/api`
- **Autenticación**: JWT (Bearer Token) en el header `Authorization`.
- **Formato de datos**: JSON en todas las peticiones y respuestas.
- **Frontend a construir**: React + Tailwind CSS, consumiendo esta API vía `fetch` o `axios`.

Todos los endpoints (excepto `POST /api/auth/login`) requieren el header:
```
Authorization: Bearer <token_jwt>
```
Si falta o es inválido, la API responde `401` o `403` con `{ "mensaje": "..." }`.

## 2. Módulo de Autenticación

### `POST /api/auth/login`
**Body:**
```json
{ "email": "usuario@fitgo.com", "password": "123456" }
```
**Respuesta exitosa (200):**
```json
{
  "mensaje": "Inicio de sesión exitoso.",
  "token": "eyJhbGciOi...",
  "usuario": { "id": 1, "nombre": "Juan Pérez", "rol": "Administrador" }
}
```
**Errores:** `400` (faltan campos), `401` (credenciales incorrectas).

El frontend debe:
- Guardar el `token` y los datos de `usuario` (en memoria/contexto de React, no en `localStorage` si se usa como artifact, pero en un proyecto real de React sí puede usarse `localStorage`).
- Redirigir según el `rol` recibido (ver sección 3).
- Adjuntar el token en cada petición posterior.
- Si cualquier endpoint responde `401`/`403` con token inválido, redirigir al login.

## 3. Roles y control de acceso en la UI

Los roles existentes (tabla `roles`) son exactamente estos tres:

- **Administrador**: acceso total. Único rol que debe ver Dashboard, y los CRUD de Usuarios y Roles.
- **Personal** (recepción/staff del gimnasio): gestiona Socios, Membresías, Clases, Inscripciones y usa la pantalla de Check-in. No debería ver Dashboard ni el CRUD de Usuarios/Roles.
- **Cliente**: rol pensado para el propio socio (si más adelante se habilita un login para socios). Por ahora, en esta fase del frontend, el login solo lo usan Administrador y Personal — no construir un flujo de login para Cliente todavía a menos que se indique lo contrario.

La UI debe:
- Mostrar/ocultar menús según el `rol` recibido en el login (ej. Dashboard y CRUD de Usuarios/Roles solo para `Administrador`).
- El backend igual valida permisos vía middleware; la UI solo refleja esto para mejor UX, no es la única barrera de seguridad.

## 4. CRUD estándar (patrón repetido)

Los siguientes recursos siguen el mismo patrón REST. Para cada uno: `GET /` (listar), `GET /:id` (detalle), `POST /` (crear), `PUT /:id` (actualizar), `DELETE /:id` (eliminar).

| Recurso | Ruta base | Campos del formulario |
|---|---|---|
| Roles | `/api/roles` | `nombre`, `descripcion` |
| Usuarios | `/api/usuarios` | `nombre`, `email`, `password`, `rol_id` |
| Socios | `/api/socios` | `nombre`, `dni`, `telefono`, `email` (el `estado` lo maneja el sistema, no editable a mano en creación) |
| Membresías | `/api/membresias` | ver sección 5 (lógica especial) |
| Entrenadores | `/api/entrenadores` | `nombres`, `telefono`, `especialidad` |
| Clases | `/api/clases` | `nombre`, `horario` (datetime), `cupo` (número), `entrenador_id` (select) |
| Asistencias | `/api/asistencias` | solo lectura/eliminación desde UI; la creación es vía check-in (sección 6) |
| Inscripciones | `/api/inscripciones` | ver sección 7 |

Todas las respuestas de listado devuelven un array de objetos. Los errores devuelven `{ "mensaje": "...", "error": "..." }` con código `404` (no encontrado) o `500` (error interno).

## 5. Módulo de Membresías (lógica especial)

- `POST /api/membresias` → **Compra inicial**. Body: `{ "socio_id": 1, "tipo": "Mensual" }` (o `"Trimestral"`, `"Anual"`). La `fecha_fin` la calcula el backend automáticamente. El socio pasa a `estado: "Activo"`.
- `PUT /api/membresias/:id/renovar` → **Renovación manual**. Body: `{ "tipo": "Mensual" }` (opcional, si no se envía usa el mismo tipo). Crea una nueva membresía (conserva historial); si la actual no había vencido, la nueva empieza donde termina la anterior.

**Pantallas sugeridas:**
- Formulario de "Nueva membresía" dentro del perfil del socio, con selector de `tipo` (Mensual/Trimestral/Anual).
- Botón "Renovar" en el historial de membresías del socio.
- Mostrar historial completo de membresías por socio (usar `GET /api/socios/:id`, que incluye sus membresías).

> Nota: la congelación de membresías está pendiente de implementar en el backend — no construir esa funcionalidad en el frontend todavía.

## 6. Check-in (control de acceso)

### `POST /api/asistencias/check-in`
**Body:**
```json
{ "dni": "12345678" }
```
El mismo campo `dni` se usa tanto si se escribe manualmente como si viene de un lector QR (el QR codifica el DNI como texto plano).

**Respuestas posibles:**
- `200` — Acceso permitido, incluye datos del socio y la asistencia creada.
- `403` — Acceso denegado (`estado` Vencido, Congelado, o membresía sin vigencia real). Incluye `mensaje` y `estado`.
- `404` — Socio no encontrado.

**Pantalla sugerida:** una vista tipo "Recepción / Check-in" con:
- Input grande para escanear/escribir el DNI (auto-focus, se limpia tras cada envío).
- Feedback visual grande y claro: verde + nombre del socio si `acceso: "PERMITIDO"`, rojo + motivo si `"DENEGADO"`.
- Sonido o animación breve de confirmación (opcional, mejora UX en recepción).

## 7. Módulo de Clases e Inscripciones

- `POST /api/clases/:clase_id/inscribir` → Body: `{ "socio_id": 1 }`. Valida cupo automáticamente (`409` si ya inscrito, `400` si no hay cupo).
- `DELETE /api/clases/:clase_id/inscripcion/:socio_id` → cancela una inscripción puntual.
- `GET /api/inscripciones/clase/:clase_id` → devuelve `{ clase, cupo_maximo, inscritos_actuales, cupos_disponibles, inscripciones: [...] }`. **Ideal para la vista de detalle de una clase.**
- `GET /api/inscripciones/socio/:socio_id` → todas las clases de un socio.
- `GET /api/inscripciones` y `DELETE /api/inscripciones/:id` → listado general y eliminación por ID.

**Pantallas sugeridas:**
- Calendario o lista de clases (`GET /api/clases`, incluye datos del entrenador).
- Vista de detalle de clase mostrando cupos ocupados/disponibles con barra de progreso, y lista de inscritos.
- Botón "Inscribir socio" (buscador de socio por nombre/DNI + botón), deshabilitado visualmente si `cupos_disponibles === 0`.

## 8. Dashboard administrativo

### `GET /api/dashboard`
**Respuesta:**
```json
{
  "resumen": { "total_socios": 120, "activos": 95, "vencidos": 25 },
  "socios_por_vencer": [
    { "socio_id": 4, "nombre": "Ana Ruiz", "fecha_fin": "2026-08-14", "dias_restantes": 4 }
  ],
  "alertas": [
    "⚠️ Hay 25 socio(s) con membresía vencida.",
    "⏰ 3 socio(s) vencen en los próximos 7 días: Ana Ruiz, ..."
  ]
}
```

**Pantalla sugerida (solo rol Administrador):**
- 3 tarjetas KPI arriba: Total socios, Activos, Vencidos (con colores: verde/rojo).
- Lista o tabla de "Socios por vencer" con `dias_restantes` resaltado (rojo si ≤2 días).
- Banner de alertas de texto en la parte superior (una por línea, con ícono según contenido).

## 9. Estructura de páginas sugerida para el frontend

```
/login                     → Formulario de login
/dashboard                 → Solo Administrador (KPIs + alertas)
/socios                    → Listado + búsqueda por nombre/DNI
/socios/:id                → Perfil: datos, membresías (comprar/renovar), asistencias, clases inscritas
/membresias                → Listado general (opcional, filtrable por estado)
/clases                    → Listado/calendario de clases
/clases/:id                → Detalle: cupo, inscritos, botón inscribir
/entrenadores               → CRUD de entrenadores
/checkin                   → Pantalla de recepción (control de acceso)
/usuarios                  → CRUD de usuarios del sistema (solo Administrador)
/roles                     → CRUD de roles (solo Administrador)
```

## 10. Convenciones para el frontend

- Usar un cliente HTTP centralizado (ej. `axios.create()`) que inyecte automáticamente el header `Authorization` y capture errores `401/403` para redirigir al login.
- Todos los mensajes de error/éxito del backend vienen en la propiedad `mensaje` — mostrarlos en toasts/notificaciones.
- Los estados de socio (`estado`) son: `"Activo"` (verde), `"Vencido"` (rojo). Usar estos colores de forma consistente en toda la UI (badges, tablas, KPIs).
- Fechas (`fecha_inicio`, `fecha_fin`, `fecha_registro`) llegan en formato `YYYY-MM-DD`; `horario` y `fecha` (asistencias) llegan como timestamp ISO completo.
- Tailwind: usar un layout tipo sidebar + topbar para el panel administrativo; la pantalla `/checkin` puede ser standalone/fullscreen (pensada para una tablet en recepción).
