import { Injectable } from '@angular/core';
import { SYSTEM_PROMPT } from './prompt';
import { GEMINI_API_KEY } from '../config';

/**
 * Etapa 4 — Generación con IA.
 * Llama directamente a la API REST de Gemini (generateContent) desde el
 * navegador con la API key que el usuario pega en la UI. Sin backend.
 */
@Injectable({ providedIn: 'root' })
export class GeminiService {
  readonly defaultModel = 'gemini-3.5-flash';
  private readonly endpoint = 'https://generativelanguage.googleapis.com/v1beta/models';

  async generateLanding(
    markdown: string,
    apiKey: string = GEMINI_API_KEY,
    model: string = this.defaultModel,
  ): Promise<string> {
    if (!apiKey || apiKey.startsWith('PEGA_')) {
      throw new Error('Falta la API key de Gemini. Edita src/app/config.ts.');
    }
    const url = `${this.endpoint}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const body = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: markdown }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 32768,
        // Desactivar "thinking" para respuesta rápida en la demo.
        thinkingConfig: { thinkingBudget: 0 },
      },
    };

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (e) {
      throw new Error('No se pudo conectar con Gemini. Revisa tu conexión.');
    }

    if (!res.ok) {
      const detail = await this.readError(res);
      if (res.status === 400 || res.status === 403) {
        throw new Error(`API key inválida o sin permisos. (${detail})`);
      }
      if (res.status === 429) {
        throw new Error('Límite de la API alcanzado. Espera un momento e intenta de nuevo.');
      }
      throw new Error(`Error de Gemini (${res.status}): ${detail}`);
    }

    const data = await res.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ??
      undefined;

    if (!text) {
      const reason = data?.candidates?.[0]?.finishReason ?? 'desconocida';
      throw new Error(`Gemini no devolvió contenido (razón: ${reason}).`);
    }

    return this.stripFences(text);
  }

  /** Quita las cercas ```html ... ``` por si el modelo las añade. */
  private stripFences(text: string): string {
    let t = text.trim();
    const fence = t.match(/^```(?:html)?\s*([\s\S]*?)\s*```$/i);
    if (fence) t = fence[1].trim();
    return t;
  }

  private async readError(res: Response): Promise<string> {
    try {
      const data = await res.json();
      return data?.error?.message ?? res.statusText;
    } catch {
      return res.statusText;
    }
  }
}
