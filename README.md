# Web Template Front

Base común de todo sistema administrativo: **login + seguridad + shell admin + parámetros
de sistema**, ya cableado y listo para usar. Se clona para arrancar un sistema nuevo y el
desarrollo se enfoca solo en los módulos de negocio.

Angular 21 · PrimeNG 21 (preset Aura) · Tailwind v4 · Vitest.

---

## Qué trae la base

| Área | Contenido |
|---|---|
| **Auth / seguridad** | Login con cifrado RSA del password (`jsencrypt` + challenge/nonce), guard de ruta, interceptor de token + manejo de 401/403, `TokenStorageService`, diálogo de cambio de password forzado |
| **Loading** | Interceptor HTTP + `LoadingOverlayService` + overlay global (`app-global-loading`, `anillos-loader`) |
| **Shell admin** (`/dashboard`) | Layout adaptado de Sakai: topbar, sidebar con menú desde backend, footer, configurador de tema (color / superficie / modo menú), buscador de menús (Ctrl+K), toggle claro/oscuro |
| **Parámetros de sistema** (`/dashboard/parametros-sistema`) | Control de usuarios · Mantenimiento de menús · Mantenimiento de roles · Mantenimiento de sistemas · Modelos y permisos |
| **Flujo de permisos** | `PermisoService` (rol + permisos + menús desde `/auth/me`), servicios CRUD de usuarios / roles / menús / sistemas / permiso-rol / permiso-usuario / rol-usuario |
| **Helpers compartidos** | `helper-message` (toasts + errores HTTP), `helper-validaciones` (requeridos, correo, DNI/RUC/teléfono), `prime-icons`, árboles de menú |
| **Infra** | Alias de paths (`@services`, `@shared`, …), generador de rutas por carpetas (`npm run gen:routes`), hook de pre-commit, `nginx-template.conf`, `vercel.json` |

Rutas: `/` → `/login` → (autenticado) `/dashboard`.

---

## Puesta en marcha

```bash
npm install
npm start          # http://localhost:4200
```

Requiere un backend con los endpoints `auth/*` y `siaw_*` (ver `src/environments/environment.ts`).

---

## Configurar un sistema nuevo (al clonar)

1. **`package.json`** → `name`.
2. **`src/environments/environment.ts`** y **`environment.production.ts`**:
   - `appName` / `appShortName` — nombre visible (topbar, footer, login, inicio).
   - `apiUrl` — URL del backend.
3. **`src/index.html`** → `<title>`.
4. **`public/favicon.ico`** → ícono propio.
5. **Tema** (opcional): `src/app/app.config.ts` → `AppPreset`, cambiar la paleta `violet` por la del sistema (`indigo`, `blue`, …). Default de arranque en `src/app/shared/layout/shell/layout.service.ts`.
6. **`angular.json`** → nombre del proyecto y `outputPath` si aplica.
7. **Despliegue**: ajustar `nginx-template.conf` (dominio, ruta, puerto del backend) o `vercel.json`.

Los menús, roles y permisos **no** se tocan en código: se cargan del backend y se
administran desde `/dashboard/parametros-sistema`.

---

## Agregar un módulo de negocio

1. Crear la carpeta bajo `src/app/pages/dashboard-admin/<modulo>/` con su componente
   (`ng g c pages/dashboard-admin/<modulo>/<modulo>`).
2. `npm run gen:routes` regenera `dashboard-admin.routes.ts` a partir de las carpetas.
3. Dar de alta el menú/permiso desde `/dashboard/parametros-sistema`.

Ver el vault de Obsidian *Template Estandar Frontend* para los patrones de componente,
servicio, interfaz y tabla.

---

## Comandos

| Comando | Efecto |
|---|---|
| `npm start` | Dev server |
| `npm run build` | Build de producción (`dist/`) |
| `npm test` | Unit tests (Vitest) |
| `npm run gen:routes` | Regenera las rutas de `dashboard-admin` desde las carpetas |
| `npm run format` | Prettier sobre `src/` |
