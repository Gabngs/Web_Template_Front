export const environment = {
  production: false,

  // ── Configuración por sistema (editar al clonar el template) ─────────────
  appName: 'Web Template', // nombre visible: topbar, footer, login, inicio
  appShortName: 'WT', // sigla corta: footer
  // Código del sistema propio en siaw_sistemas. El sidebar y Mantenimiento de
  // Menús filtran por este código (el template es mono-sistema: solo ve lo suyo).
  sistemaCodigo: 'NEXO',

  // ── Backend ────────────────────────────────────────────────────────────
  apiUrl: 'http://localhost:8877/api/',
  endpoints: {
    auth: {
      publicKey: 'auth/public-key',
      challenge: 'auth/challenge',
      login: 'auth/login',
      logout: 'auth/logout',
      me: 'auth/me',
      permisos: 'auth/permisos',
      sessions: 'auth/sessions',
      resetPassword: 'auth/reset-password', // + /{id}
      cambiarPassword: 'auth/cambiar-password',
      unblock: 'auth/unblock', // + /{email}
    },
    siaw: {
      usuarios: 'siaw_usuarios',
      roles: 'siaw_roles',
      contentModel: 'siaw_content_model',
      contentPermisos: 'siaw_content_permisos',
      menus: 'siaw_menus',
      menuPermiso: 'siaw_menu_permiso',
      sistemas: 'siaw_sistemas',
      rolUsuario: 'siaw_rol_usuario',
      permisoRol: 'siaw_permiso_rol',
      permisoUsuario: 'siaw_permiso_usuario',
    },
  },
};
