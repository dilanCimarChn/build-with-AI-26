import { Injectable } from '@angular/core';
import { TokenStats } from './models';

/**
 * Estimación de tokens (heurística ~4 caracteres por token, estándar de la
 * industria para texto en español/inglés). No necesitamos exactitud absoluta:
 * el objetivo es mostrar la magnitud del ahorro PDF crudo -> Markdown.
 */
@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly CHARS_PER_TOKEN = 4;

  /** Tokens estimados de un texto cualquiera. */
  countText(text: string): number {
    return Math.round(text.length / this.CHARS_PER_TOKEN);
  }

  /**
   * Tokens estimados si se enviara el PDF "directo" (codificado base64).
   * base64 infla el binario ~4/3, y eso se tokeniza a ~4 chars/token,
   * resultando en aprox. fileSize / 3 tokens.
   */
  countRawPdf(fileSizeBytes: number): number {
    const base64Len = Math.ceil(fileSizeBytes / 3) * 4;
    return Math.round(base64Len / this.CHARS_PER_TOKEN);
  }

  buildStats(fileSizeBytes: number, markdown: string): TokenStats {
    const originalTokens = this.countRawPdf(fileSizeBytes);
    const mdTokens = this.countText(markdown);
    const savingsPct =
      originalTokens > 0
        ? Math.max(0, Math.round((1 - mdTokens / originalTokens) * 100))
        : 0;
    return { originalTokens, mdTokens, savingsPct };
  }
}
