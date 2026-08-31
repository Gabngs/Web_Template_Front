// AUTO-GENERADOR de *.routes.ts para dominios bajo src/app/pages/dashboard-admin.
//
// Convención (ver Estructura de Carpetas y Routing, Obsidian Vault):
// - Una carpeta `{x}/` es HOJA si contiene `{x}.ts` (el componente que genera `ng g c`).
// - Si no tiene `{x}.ts` propio pero contiene subcarpetas que sí, es un SUB-DOMINIO:
//   se le genera su propio `{x}.routes.ts` recursivamente.
// - `{padre}-shell/` junto a un dominio es su wrapper opcional (tabs/layout propio):
//   nunca se registra como ruta hoja, envuelve a sus hermanos como `children`.
// - Ruta por defecto (`path: ''`): carpeta `inicio` si existe; si no, `route.config.json`
//   con `{ "default": "carpeta-hermana" }` (redirect relativo, se valida que la carpeta exista)
//   o `{ "redirectTo": "/ruta/absoluta" }` (redirect literal, para saltar fuera del dominio);
//   si no hay nada, la primera carpeta en orden alfabético (con warning).
//
// Uso: node scripts/generate-routes.mjs

import { existsSync, readdirSync, statSync, writeFileSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PAGES_ROOT = join(__dirname, '..', 'src', 'app', 'pages');
const DASHBOARD_ADMIN_DIR = join(PAGES_ROOT, 'dashboard-admin');

const toPascalCase = (kebab) =>
  kebab.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');

const toScreamingSnake = (kebab) => kebab.replace(/-/g, '_').toUpperCase();

function isLeaf(dir, name) {
  return existsSync(join(dir, name, `${name}.ts`));
}

function subdirs(dir) {
  return readdirSync(dir).filter(name => statSync(join(dir, name)).isDirectory());
}

// route.config.json (opcional, junto a un dominio):
//   { "default": "carpeta-hermana" }  -> redirect RELATIVO a esa subcarpeta (se valida que exista)
//   { "redirectTo": "/ruta/absoluta" } -> redirect LITERAL (para saltar fuera del dominio)
// Si no hay ninguno, gana la carpeta "inicio"; si tampoco, la primera alfabética (con warning).
function readRouteConfig(dir) {
  const configPath = join(dir, 'route.config.json');
  if (!existsSync(configPath)) return {};
  try {
    return JSON.parse(readFileSync(configPath, 'utf8')) ?? {};
  } catch (e) {
    console.warn(`[generate-routes] route.config.json inválido en ${dir} — se ignora (${e.message}).`);
    return {};
  }
}

/**
 * Procesa un dominio: genera (si hace falta) los .routes.ts de sus sub-dominios,
 * y devuelve las entradas Routes[] para montar como children de quien lo llama.
 */
function buildDomainEntries(dir) {
  const domainName = basename(dir);
  const all = subdirs(dir);
  const shellName = `${domainName}-shell`;
  const hasShell = all.includes(shellName) && isLeaf(dir, shellName);
  const candidates = all.filter(name => name !== shellName);

  const items = candidates.map(name => {
    if (isLeaf(dir, name)) {
      return { name, kind: 'leaf' };
    }
    // Sub-dominio: recursión — genera su propio archivo de rutas.
    const subEntries = buildDomainEntries(join(dir, name));
    writeRoutesFile(join(dir, name), subEntries);
    return { name, kind: 'domain' };
  });

  const config = readRouteConfig(dir);

  // Resolución de la ruta '' del dominio, por prioridad:
  //   1. carpeta "inicio"            -> loadComponent en ''
  //   2. config.redirectTo (abs)     -> redirect literal (ej. "/dashboard")
  //   3. config.default (hermana)    -> redirect relativo, validado contra las carpetas reales
  //   4. primera carpeta alfabética  -> redirect relativo (+ warning)
  let defaultName = items.find(i => i.name === 'inicio')?.name ?? null;
  let defaultIsInicio = !!defaultName;
  let redirectAbsoluto = null;

  if (!defaultName && typeof config.redirectTo === 'string' && config.redirectTo.trim()) {
    redirectAbsoluto = config.redirectTo.trim();
  }

  if (!defaultName && !redirectAbsoluto && config.default) {
    if (items.some(i => i.name === config.default)) {
      defaultName = config.default;
    } else {
      console.warn(
        `[generate-routes] "${domainName}/route.config.json": "default": "${config.default}" ` +
        `no es una subcarpeta de este dominio (${items.map(i => i.name).join(', ') || 'sin subcarpetas'}). ` +
        `Usá el nombre de una carpeta hermana, o "redirectTo": "/ruta/absoluta" para salir del dominio.`,
      );
    }
  }

  if (!defaultName && !redirectAbsoluto && items.length) {
    defaultName = [...items].sort((a, b) => a.name.localeCompare(b.name))[0].name;
    console.warn(
      `[generate-routes] "${domainName}" sin "inicio" ni route.config.json válido — ` +
      `default inferido alfabéticamente: "${defaultName}". ` +
      `Si no es el correcto, crea ${join(dir, 'route.config.json')} con ` +
      `{ "default": "carpeta" } o { "redirectTo": "/ruta" }.`,
    );
  }

  const routeEntry = (item, path) => {
    const importPath = `./${item.name}/${item.name}${item.kind === 'domain' ? '.routes' : ''}`;
    const memberName = item.kind === 'domain'
      ? toScreamingSnake(item.name) + '_ROUTES'
      : toPascalCase(item.name);
    return item.kind === 'domain'
      ? { path, loadChildren: `() => import('${importPath}').then(m => m.${memberName})` }
      : { path, loadComponent: `() => import('${importPath}').then(m => m.${memberName})` };
  };

  const entries = [];
  if (defaultIsInicio) {
    entries.push(routeEntry(items.find(i => i.name === defaultName), "''"));
  } else if (redirectAbsoluto) {
    entries.push({ path: "''", redirectTo: `'${redirectAbsoluto}'`, pathMatch: "'full'" });
  } else if (defaultName) {
    entries.push({ path: "''", redirectTo: `'${defaultName}'`, pathMatch: "'full'" });
  }
  for (const item of items) {
    if (item.name === defaultName && defaultIsInicio) continue;
    entries.push(routeEntry(item, `'${item.name}'`));
  }


  entries.push({ path: "'**'", loadComponent: "() => import('@shared/components/not-found/not-found').then(m => m.NotFound)" });

  return { entries, hasShell, shellName, domainName };
}

function renderEntry(e, indent) {
  const pad = '  '.repeat(indent);
  const parts = Object.entries(e).map(([k, v]) => `${k}: ${v}`);
  return `${pad}{ ${parts.join(', ')} },`;
}

function writeRoutesFile(dir, built) {
  const { entries, hasShell, shellName, domainName } = built;
  const constName = `${toScreamingSnake(domainName)}_ROUTES`;
  const outPath = join(dir, `${domainName}.routes.ts`);

  let body;
  if (hasShell) {
    const shellClass = toPascalCase(shellName);
    body = [
      '{',
      `    path: '',`,
      `    loadComponent: () => import('./${shellName}/${shellName}').then(m => m.${shellClass}),`,
      '    children: [',
      ...entries.map(e => renderEntry(e, 3)),
      '    ],',
      '  },',
    ].join('\n');
    body = `[\n  ${body}\n]`;
  } else {
    body = `[\n${entries.map(e => renderEntry(e, 1)).join('\n')}\n]`;
  }

  const content = `// AUTO-GENERADO por scripts/generate-routes.mjs — no editar a mano.
// Ruta por defecto ('' del dominio): carpeta "inicio", o route.config.json con
// { "default": "carpeta-hermana" } (redirect relativo) o { "redirectTo": "/ruta" }.
import { Routes } from '@angular/router';

export const ${constName}: Routes = ${body};
`;
  writeTracked(outPath, content);
}


const tracked = [];
function writeTracked(outPath, content) {
  tracked.push({ outPath, before: existsSync(outPath) ? readFileSync(outPath, 'utf8') : null });
  writeFileSync(outPath, content, 'utf8');
}

// --- Nivel 1: dashboard-admin.routes.ts (caso especial, envuelve AdminShell compartido) ---
function writeDashboardAdminRoutes() {
  const built = buildDomainEntries(DASHBOARD_ADMIN_DIR);
  const childrenLines = built.entries.map(e => renderEntry(e, 3)).join('\n');
  const outPath = join(DASHBOARD_ADMIN_DIR, 'dashboard-admin.routes.ts');
  const content = `// AUTO-GENERADO por scripts/generate-routes.mjs — no editar a mano.
import { Routes } from '@angular/router';

export const DASHBOARD_ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../shared/layout/admin-shell/admin-shell').then(m => m.AdminShell),
    children: [
${childrenLines}
    ],
  },
];
`;
  writeTracked(outPath, content);
}

writeDashboardAdminRoutes();

try {
  execSync('npx prettier --write --log-level=silent "src/app/pages/dashboard-admin/**/*.routes.ts"', {
    cwd: join(__dirname, '..'),
    stdio: 'inherit',
  });
} catch {
  console.warn('[generate-routes] prettier no disponible o falló — revisar formato a mano.');
}

const changedFiles = tracked.filter(t => readFileSync(t.outPath, 'utf8') !== t.before);
if (changedFiles.length) {
  for (const f of changedFiles) {
    console.log(`[generate-routes] actualizado ${f.outPath.replace(join(__dirname, '..') + '\\', '')}`);
  }
} else {
  console.log('[generate-routes] sin cambios — estructura de carpetas ya está reflejada en las rutas.');
}
