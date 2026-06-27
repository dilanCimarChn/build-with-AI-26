// PLANTILLA. Copia este archivo a `config.ts` (en la misma carpeta) y rellena
// tus claves reales. `config.ts` está en .gitignore y NUNCA se sube a git.
//
//   cp src/app/config.example.ts src/app/config.ts
//
// ⚠️ Las claves quedan embebidas en el front (MVP). No publiques la app con
// claves reales en un sitio público; para producción, muévelas a un backend.

/** API key de Gemini (https://aistudio.google.com/apikey). */
export const GEMINI_API_KEY = 'PEGA_AQUI_TU_API_KEY_DE_GEMINI';

/** Configuración del despliegue automático a GitHub Pages. */
export const DEPLOY = {
  /**
   * Personal Access Token de GitHub con escritura de contenidos:
   *  - Classic: scope "repo".
   *  - Fine-grained: permiso "Contents: Read and write" sobre el repo de abajo.
   * Crear en: https://github.com/settings/tokens
   */
  githubToken: 'PEGA_AQUI_TU_TOKEN_DE_GITHUB',

  /** Tu usuario u organización de GitHub (dueño del repo). */
  owner: 'dilanCimarChn',

  /** Repo donde se guardan las landings generadas (sites/<slug>/index.html). */
  repo: 'build-with-AI-26',

  /** Rama donde se hace commit. */
  branch: 'main',
};
