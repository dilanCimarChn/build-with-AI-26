import { Injectable } from '@angular/core';
import { DEPLOY } from '../config';

/**
 * Etapa 6 — Despliegue automático (sin backend).
 * Sube la landing generada a un repo único de GitHub vía la API REST de
 * Contents y la sirve con GitHub Pages. Todo desde el navegador: la API de
 * GitHub permite peticiones cross-origin con un Personal Access Token.
 *
 * Cada landing se guarda en `sites/<slug>/index.html`, así que la URL pública es
 * https://<owner>.github.io/<repo>/sites/<slug>/
 */
@Injectable({ providedIn: 'root' })
export class DeployService {
  private readonly api = 'https://api.github.com';

  /**
   * Despliega el HTML y devuelve la URL pública.
   * @param html  HTML autocontenido de la landing.
   * @param title Título (p. ej. el primer encabezado del Markdown) para el slug.
   */
  async deploy(html: string, title: string): Promise<string> {
    if (
      DEPLOY.githubToken.startsWith('PEGA_') ||
      DEPLOY.owner.startsWith('TU_')
    ) {
      throw new Error(
        'Falta configurar el despliegue. Edita src/app/config.ts con tu token y usuario de GitHub.',
      );
    }

    const slug = this.makeSlug(title);
    const path = `sites/${slug}/index.html`;
    const url = `${this.api}/repos/${DEPLOY.owner}/${DEPLOY.repo}/contents/${path}`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${DEPLOY.githubToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Publicar landing: ${slug}`,
          content: this.toBase64Utf8(html),
          branch: DEPLOY.branch,
        }),
      });
    } catch {
      throw new Error('No se pudo conectar con GitHub. Revisa tu conexión.');
    }

    if (!res.ok) {
      const detail = await this.readError(res);
      if (res.status === 401) {
        throw new Error('Token de GitHub inválido o expirado. Revisa config.ts.');
      }
      if (res.status === 403) {
        throw new Error(`El token no tiene permiso de escritura. (${detail})`);
      }
      if (res.status === 404) {
        throw new Error(
          `No se encontró el repo "${DEPLOY.owner}/${DEPLOY.repo}". Créalo y revisa el token. (${detail})`,
        );
      }
      throw new Error(`Error de GitHub (${res.status}): ${detail}`);
    }

    return `https://${DEPLOY.owner}.github.io/${DEPLOY.repo}/sites/${slug}/`;
  }

  /** Slug único a partir del título: "Salar de Uyuni" -> "salar-de-uyuni-l8f3a2". */
  private makeSlug(title: string): string {
    const base =
      title
        .replace(/^#+\s*/, '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '') // quita acentos/diacríticos
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'landing';
    const id = Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 4);
    return `${base}-${id}`;
  }

  /** Base64 de una cadena UTF-8, robusto para HTML grande (por chunks). */
  private toBase64Utf8(str: string): string {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  private async readError(res: Response): Promise<string> {
    try {
      const data = await res.json();
      return data?.message ?? res.statusText;
    } catch {
      return res.statusText;
    }
  }
}
